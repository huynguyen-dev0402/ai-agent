import { BadRequestException, Injectable, UseGuards } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { hashPassword } from 'src/utils/hash-password/hashing.util';
import { generateUniqueString } from 'src/utils/generate-random/generate-username.util';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}
  async create(createUserDto: CreateUserDto) {
    const { email, password } = createUserDto;
    //exsits info
    const exsits = await this.userRepository.findOne({
      where: {
        email,
      },
    });
    if (exsits) {
      throw new BadRequestException('email already exists');
    }
    createUserDto['username'] = generateUniqueString('username');
    createUserDto.password = await hashPassword(password);
    const newUser = this.userRepository.create(createUserDto);
    return await this.userRepository.save(newUser);
  }

  async findAll() {
    return await this.userRepository.find();
  }

  async findOne(id: string) {
    return await this.userRepository.findOne({
      where: {
        id,
      },
    });
  }

  async findOneByEmail(email: string) {
    return await this.userRepository.findOne({
      where: {
        email,
      },
    });
  }

  async findOneByPhone(phone: string) {
    return await this.userRepository.findOne({
      where: {
        phone,
      },
    });
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: string) {
    return `This action removes a #${id} user`;
  }
}
