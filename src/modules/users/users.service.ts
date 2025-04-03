import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserStatus } from './entities/user.entity';
import { In, Repository } from 'typeorm';
import { hashPassword } from 'src/utils/hash-password/hashing.util';
import { generateUniqueString } from 'src/utils/generate-random/generate-username.util';
import { plainToInstance } from 'class-transformer';

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
    createUserDto['username'] = generateUniqueString('user');
    createUserDto.password = hashPassword(password);
    const newUser = this.userRepository.create(createUserDto);
    await this.userRepository.save(newUser);
    return plainToInstance(User, newUser);
  }

  async findAll() {
    const users = await this.userRepository.find({
      where: {
        status: UserStatus.ACTIVE,
      },
    });
    return plainToInstance(User, users);
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({
      where: {
        id,
        status: UserStatus.ACTIVE,
      },
    });
    return plainToInstance(User, user);
  }

  async findOneByEmail(email: string) {
    return await this.userRepository.findOne({
      where: {
        email,
        status: UserStatus.ACTIVE,
      },
    });
  }

  async findOneByPhone(phone: string) {
    const user = await this.userRepository.findOne({
      where: {
        phone,
        status: UserStatus.ACTIVE,
      },
    });
    return plainToInstance(User, user);
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  async remove(id: string) {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
    });
    if (user) {
      const response = await this.userRepository.delete(id);
      return { response, user: plainToInstance(User, user) };
    } else {
      return {
        message: 'User not found',
        user: [],
      };
    }
  }

  //Delete list of users by ids
  async removeManyUser(ids: number[]) {
    const users = await this.userRepository.find({
      where: { id: In(ids) },
    });
    if (users) {
      const response = await this.userRepository.delete(ids);
      return { response, users: plainToInstance(User, users) };
    } else {
      return {
        message: 'User not found',
        users: [],
      };
    }
  }
}
