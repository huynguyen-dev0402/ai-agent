import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
  NotFoundException,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Customer } from './entities/customer.entity';
import { AuthService } from '../auth/auth.service';
import { AuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(AuthGuard)
@Controller('customers')
@ApiTags('customers')
@ApiBearerAuth('access-token')
export class CustomersController {
  constructor(
    private readonly customersService: CustomersService,
    private readonly authService: AuthService,
  ) {}

  @Post()
  async create(@Body() createCustomerDto: CreateCustomerDto) {
    const customer = await this.customersService.create(createCustomerDto);
    if (!customer) {
      throw new BadRequestException('Cannot create customer');
    }
    return customer;
  }

  @Get()
  async findAll() {
    const customsers = await this.customersService.findAll();
    if (!customsers) {
      throw new NotFoundException('Customsers not found');
    }
    return {
      success: true,
      message: 'Customers found successfully',
      customsers,
    };
  }

  @Get('/profile')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get customer info' })
  @ApiResponse({ status: 200, description: 'Customer found', type: Customer })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getInfoCustomer(
    @Req() request: Request & { user: { [key: string]: string } },
  ) {
    const accessToken = request.user.accessToken;
    if (request.user.accountType === 'personal') {
      throw new NotFoundException('Customer not found');
    }
    const customer = await this.authService.getUser(accessToken);
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    return {
      success: true,
      message: 'Get customer info successfully',
      customer,
    };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.customersService.update(id, updateCustomerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.customersService.remove(id);
  }
}
