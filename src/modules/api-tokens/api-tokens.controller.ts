import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ApiTokensService } from './api-tokens.service';
import { CreateApiTokenDto } from './dto/create-api-token.dto';
import { UpdateApiTokenDto } from './dto/update-api-token.dto';
import { ApiToken } from './entities/api-token.entity';

@ApiTags('API Tokens')
@ApiBearerAuth()
@Controller('api-tokens')
export class ApiTokensController {
  constructor(private readonly apiTokensService: ApiTokensService) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create a new API token' })
  @ApiBody({ type: CreateApiTokenDto })
  @ApiResponse({
    status: 201,
    description: 'The API token has been successfully created.',
    type: ApiToken,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing authentication token.',
  })
  create(@Body(new ValidationPipe()) createApiTokenDto: CreateApiTokenDto) {
    return this.apiTokensService.create(createApiTokenDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all API tokens' })
  @ApiResponse({
    status: 200,
    description: 'List of all API tokens.',
    type: [ApiToken],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing authentication token.',
  })
  findAll() {
    return this.apiTokensService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an API token by ID' })
  @ApiParam({
    name: 'id',
    description: 'UUID of the API token',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'The API token details.',
    type: ApiToken,
  })
  @ApiResponse({
    status: 404,
    description: 'API token not found.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing authentication token.',
  })
  findOne(@Param('id') id: string) {
    return this.apiTokensService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an API token' })
  @ApiParam({
    name: 'id',
    description: 'UUID of the API token',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({ type: UpdateApiTokenDto })
  @ApiResponse({
    status: 200,
    description: 'The API token has been successfully updated.',
    type: ApiToken,
  })
  @ApiResponse({
    status: 404,
    description: 'API token not found.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing authentication token.',
  })
  update(
    @Param('id') id: string,
    @Body(new ValidationPipe()) updateApiTokenDto: UpdateApiTokenDto,
  ) {
    return this.apiTokensService.update(id, updateApiTokenDto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete an API token' })
  @ApiParam({
    name: 'id',
    description: 'UUID of the API token',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 204,
    description: 'The API token has been successfully deleted.',
  })
  @ApiResponse({
    status: 404,
    description: 'API token not found.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing authentication token.',
  })
  remove(@Param('id') id: string) {
    return this.apiTokensService.remove(id);
  }
}
