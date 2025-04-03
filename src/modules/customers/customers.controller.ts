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
  @ApiOperation({ summary: 'Create a new customer' })
  @ApiResponse({
    status: 201,
    description: 'The customer has been successfully created.',
    type: Customer,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async create(@Body() createCustomerDto: CreateCustomerDto) {
    const customer = await this.customersService.create(createCustomerDto);
    if (!customer) {
      throw new BadRequestException('Cannot create customer');
    }
    return customer;
  }

  @Get()
  @ApiOperation({ summary: 'Get all customers' })
  @ApiResponse({
    status: 200,
    description: 'List of all customers',
    type: [Customer],
  })
  @ApiResponse({ status: 403, description: 'Forbidden' })
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
  @ApiOperation({ summary: 'Get a customer by ID' })
  @ApiResponse({
    status: 200,
    description: 'The found customer',
    type: Customer,
  })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async findOne(@Param('id') id: string) {
    if (!id) {
      throw new BadRequestException('ID is not empty or invalid');
    }
    const customer = await this.customersService.findOne(id);
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    return {
      success: true,
      message: 'Customer found successfully',
      customer,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a customer' })
  @ApiResponse({
    status: 200,
    description: 'The customer has been successfully updated.',
    type: Customer,
  })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.customersService.update(id, updateCustomerDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a customer' })
  @ApiResponse({
    status: 200,
    description: 'The customer has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async remove(@Param('id') id: string) {
    if (!id) {
      throw new BadRequestException('Please provide id to delete customer');
    }
    const { response, customer } = await this.customersService.remove(id);
    if (!customer) {
      throw new NotFoundException(`Customer not found with id: ${id}`);
    }
    if (response && response.affected) {
      return {
        success: true,
        message: `Customer deleted successfully with id: ${id}`,
        customer: customer,
      };
    }
  }
}
