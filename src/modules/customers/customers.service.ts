import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from './entities/customer.entity';
import { Repository } from 'typeorm';
import { hashPassword } from 'src/utils/hash-password/hashing.util';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}
  async create(createCustomerDto: CreateCustomerDto) {
    const { email, domain, password } = createCustomerDto;
    //exsits info
    const exsits = await this.customerRepository.findOne({
      where: [{ email }, { domain }],
    });
    if (exsits) {
      throw new BadRequestException('Email or domain already exists');
    }
    createCustomerDto.password = hashPassword(password);
    const newCustomer = this.customerRepository.create(createCustomerDto);
    await this.customerRepository.save(newCustomer);
    return plainToInstance(Customer, newCustomer);
  }

  async findAll() {
    const customers = await this.customerRepository.find({
      where: {
        status: 'active',
      },
    });
    return plainToInstance(Customer, customers);
  }

  async findOne(id: string) {
    const customer = await this.customerRepository.findOne({
      where: {
        id,
        status: 'active',
      },
    });
    return plainToInstance(Customer, customer);
  }

  async findOneByEmail(email: string) {
    return await this.customerRepository.findOne({
      where: {
        email,
        status: 'active',
      },
    });
  }

  update(id: string, updateCustomerDto: UpdateCustomerDto) {
    return `This action updates a #${id} customer`;
  }

  async remove(id: string) {
    const customer = await this.customerRepository.findOne({
      where: {
        id,
      },
    });
    if (customer) {
      const response = await this.customerRepository.delete(id);
      return { response, customer: plainToInstance(Customer, customer) };
    } else {
      return {
        message: 'Customer not found',
        customer: {},
      };
    }
  }
}
