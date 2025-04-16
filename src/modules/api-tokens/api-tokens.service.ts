import { Injectable, Logger } from '@nestjs/common';
import { CreateApiTokenDto } from './dto/create-api-token.dto';
import { UpdateApiTokenDto } from './dto/update-api-token.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiToken } from './entities/api-token.entity';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { JwtService } from '@nestjs/jwt';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class ApiTokensService {
  constructor(
    @InjectRepository(ApiToken)
    private readonly apiTokenRepository: Repository<ApiToken>,
    private readonly jwtService: JwtService,
  ) {}
  private readonly logger = new Logger(ApiTokensService.name);

  @Cron('*/10 * * * *')
  async refreshAccessTokenJob() {
    try {
      this.logger.log('Starting refreshAccessTokenJob');

      const accessToken = await this.getAccessToken();
      if (!accessToken?.access_token) {
        this.logger.error('Failed to retrieve access token');
        return;
      }

      const tokenEntity = await this.apiTokenRepository.findOne({
        where: {
          id: '1',
        },
      });
      if (!tokenEntity) {
        this.logger.error('Token with ID 1 not found');
        return;
      }

      await this.apiTokenRepository.update(1, {
        token: accessToken.access_token,
        updated_at: new Date(),
      });

      this.logger.log('Access token updated successfully');
    } catch (error) {
      this.logger.error(
        `Failed to refresh access token: ${error.message}`,
        error.stack,
      );
    }
  }

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

  create(createApiTokenDto: CreateApiTokenDto) {
    return 'This action adds a new apiToken';
  }

  findAll() {
    return `This action returns all apiTokens`;
  }

  findOne(id: string) {
    return `This action returns a #${id} apiToken`;
  }

  update(id: number, updateApiTokenDto: UpdateApiTokenDto) {
    return `This action updates a #${id} apiToken`;
  }

  remove(id: number) {
    return `This action removes a #${id} apiToken`;
  }
}
