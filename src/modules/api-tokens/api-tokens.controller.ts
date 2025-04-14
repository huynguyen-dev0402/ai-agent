import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTokensService } from './api-tokens.service';
import { CreateApiTokenDto } from './dto/create-api-token.dto';
import { UpdateApiTokenDto } from './dto/update-api-token.dto';
import { AuthGuard } from '../auth/guards/jwt-auth.guard';

//@UseGuards(AuthGuard)
@Controller('api-tokens')
export class ApiTokensController {
  constructor(private readonly apiTokensService: ApiTokensService) {}

  @Post()
  create(@Body() createApiTokenDto: CreateApiTokenDto) {
    return this.apiTokensService.create(createApiTokenDto);
  }

  @Get()
  findAll() {
    return this.apiTokensService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.apiTokensService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateApiTokenDto: UpdateApiTokenDto,
  ) {
    return this.apiTokensService.update(+id, updateApiTokenDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.apiTokensService.remove(+id);
  }
}
