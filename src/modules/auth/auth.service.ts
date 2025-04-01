import {
  comparePassword,
  hashPassword,
} from 'src/utils/hash-password/hashing.util';
import { UsersService } from './../users/users.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import * as md5 from 'md5';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    @InjectRedis() private readonly redis: Redis,
  ) {}
  async validateUser(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.userService.findOneByEmail(email);
    if (user && (await comparePassword(password, user.password))) {
      const token = await this.getToken(user);
      await this.saveTokenToRedis({
        accessToken: token.access_token,
        refreshToken: token.refresh_token,
      });
      return token;
    }
    return false;
  }

  async getToken(user: User) {
    return {
      access_token: await this.createToken(user),
      refresh_token: await this.createRefreshToken(user),
    };
  }

  createToken(user: User) {
    const payload = { email: user.email, sub: user.id };
    return this.jwtService.signAsync(payload);
  }

  decodeToken(token: string) {
    return this.jwtService.decode(token);
  }

  async createRefreshToken(user: User) {
    const payload = { email: user.email, sub: user.id };
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: process.env.JWT_REFRESH_EXPIRED,
    });
    return refreshToken;
  }

  async refreshToken(body: { refreshToken: string }) {
    const payload = this.decodeToken(body.refreshToken);
    if (!payload) {
      return false;
    }
    const user = await this.userService.findOneByEmail(payload.email);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const hashRefreshToken = md5(body.refreshToken);
    const tokenFromRedis = await this.redis.get(
      `refresh_token_${hashRefreshToken}`,
    );
    if (!tokenFromRedis) {
      return false;
    }
    //delete refresh_token on Redis
    this.revokeRefreshToken(body);
    //add access_token to blacklist
    const accessToken = JSON.parse(tokenFromRedis).access_token;
    await this.redis.set(`blacklist_${accessToken}`, accessToken);
    const token = await this.getToken(user);
    await this.saveTokenToRedis({
      accessToken: token.access_token,
      refreshToken: token.refresh_token,
    });
    return token;
  }

  revokeRefreshToken(body: { refreshToken: string }) {
    const hashRefreshToken = md5(body.refreshToken);
    this.redis.del(`refresh_token_${hashRefreshToken}`);
    return true;
  }

  async saveTokenToRedis(token: { accessToken: string; refreshToken: string }) {
    const { accessToken, refreshToken } = token;
    //Set expire time
    const currentTime = new Date().getTime() / 1000;
    const expireTime = this.decodeToken(refreshToken).exp;
    const diff = Math.round(expireTime - currentTime);
    const hashRefreshToken = md5(refreshToken);
    const hashAccessToken = md5(accessToken);
    //Save Redis
    await this.redis.set(
      `refresh_token_${hashRefreshToken}`,
      JSON.stringify({
        access_token: hashAccessToken,
        refresh_token: hashRefreshToken,
      }),
      'EX',
      diff,
    );
    return token;
  }

  async getUser(token: string) {
    const payload = this.decodeToken(token);
    if (!payload) {
      return false;
    }
    const blackListToken = await this.redis.get(`blacklist_${md5(token)}`);
    if (blackListToken) {
      return false;
    }
    return this.userService.findOne(payload.sub);
  }

  async logout(accessToken: string, exp: number) {
    const hashAccessToken = md5(accessToken);
    const expire = exp - Math.round(new Date().getTime() / 1000);
    await this.redis.set(
      `blacklist_${hashAccessToken}`,
      hashAccessToken,
      'EX',
      expire,
    );
  }
}
