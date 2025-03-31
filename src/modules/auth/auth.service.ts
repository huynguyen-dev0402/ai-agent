import { comparePassword } from 'src/utils/hash-password/hashing.util';
import { UsersService } from './../users/users.service';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}
  async validateUser(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.userService.findOneByEmail(email);
    if (user && (await comparePassword(password, user.password))) {
      return this.getToken(user);
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

  createRefreshToken(user: User) {
    const payload = { email: user.email, sub: user.id };
    return this.jwtService.signAsync(payload, {
      expiresIn: process.env.JWT_REFRESH_EXPIRED,
    });
  }

  async getUser(token: string) {
    const payload = this.decodeToken(token);
    if (!payload) {
      return false;
    }
    return this.userService.findOne(payload.sub);
  }
}
