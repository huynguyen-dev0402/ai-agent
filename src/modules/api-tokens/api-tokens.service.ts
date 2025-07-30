import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateApiTokenDto } from './dto/create-api-token.dto';
import { UpdateApiTokenDto } from './dto/update-api-token.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiToken } from './entities/api-token.entity';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class ApiTokensService {
  constructor(
    @InjectRepository(ApiToken)
    private readonly apiTokenRepository: Repository<ApiToken>,
    private readonly jwtService: JwtService,
  ) {}

  generateJWT(): string {
    const now = Math.floor(Date.now() / 1000);

    const payload = {
      iss: process.env.APP_ID_EXTERNAL,
      aud: process.env.APP_ENDPOINT,
      iat: now,
      exp: now + 600,
      jti: uuidv4(),
    };

    const headers = {
      alg: process.env.ENCODE_ALGORITHM || 'JWT',
      typ: process.env.ENCODE_TYPE || 'RS256',
      kid: process.env.PUBLIC_KEY_EXTERNAL,
    };

    return this.jwtService.sign(payload, {
      algorithm: 'RS256',
      header: headers,
    });
  }

  async getAccessToken() {
    const jwtToken = this.generateJWT();

    try {
      const response = await fetch(
        'https://api.coze.com/api/permission/oauth2/token',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            duration_seconds: 3600,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(
        'Error fetching access token:',
        error.response?.data || error.message,
      );
      throw new Error('Failed to fetch Coze access token');
    }
  }

  async create(createApiTokenDto: CreateApiTokenDto): Promise<ApiToken> {
    // Generate a unique token string
    const tokenString = `sk-${uuidv4()}${uuidv4()}`.replace(/-/g, '');
    
    const apiToken = this.apiTokenRepository.create({
      ...createApiTokenDto,
      token: tokenString,
      expires_at: new Date(createApiTokenDto.expires_at),
    });
    
    return await this.apiTokenRepository.save(apiToken);
  }

  async findAll(): Promise<ApiToken[]> {
    return await this.apiTokenRepository.find({
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<ApiToken> {
    const apiToken = await this.apiTokenRepository.findOne({
      where: { id },
    });
    
    if (!apiToken) {
      throw new NotFoundException(`API Token with ID ${id} not found`);
    }
    
    return apiToken;
  }

  async update(id: string, updateApiTokenDto: UpdateApiTokenDto): Promise<ApiToken> {
    const apiToken = await this.findOne(id);
    
    Object.assign(apiToken, updateApiTokenDto);
    
    if (updateApiTokenDto.expires_at) {
      apiToken.expires_at = new Date(updateApiTokenDto.expires_at);
    }
    
    return await this.apiTokenRepository.save(apiToken);
  }

  async remove(id: string): Promise<void> {
    const apiToken = await this.findOne(id);
    await this.apiTokenRepository.remove(apiToken);
  }
}
