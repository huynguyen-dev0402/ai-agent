import { Injectable } from '@nestjs/common';
import { CreateApiTokenDto } from './dto/create-api-token.dto';
import { UpdateApiTokenDto } from './dto/update-api-token.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiToken } from './entities/api-token.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ApiTokensService {
  constructor(
    @InjectRepository(ApiToken)
    private readonly apiTokenRepository: Repository<ApiToken>,
  ) {}
  create(createApiTokenDto: CreateApiTokenDto) {
    return 'This action adds a new apiToken';
  }

  findAll() {
    return `This action returns all apiTokens`;
  }

  findOne(id: string) {
    return `This action returns a #${id} apiToken`;
  }

  // async findApiTokenByUserId(userId: string) {
  //   const apiToken = await this.apiTokenRepository.findOne({
  //     where: { user: { id: userId } },
  //     select: {
  //       id: true,
  //       token: true,
  //     },
  //   });
  //   if (!apiToken) {
  //     return false;
  //   }
  //   return apiToken;
  // }

  update(id: number, updateApiTokenDto: UpdateApiTokenDto) {
    return `This action updates a #${id} apiToken`;
  }

  remove(id: number) {
    return `This action removes a #${id} apiToken`;
  }
}
