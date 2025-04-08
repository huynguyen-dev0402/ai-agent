import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserStatus } from './entities/user.entity';
import { In, Repository } from 'typeorm';
import { hashPassword } from 'src/utils/hash-password/hashing.util';
import { generateUniqueString } from 'src/utils/generate-random/generate-username.util';
import { plainToInstance } from 'class-transformer';
import { Workspace } from '../workspaces/entities/workspace.entity';
import { ApiToken } from '../api-tokens/entities/api-token.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Workspace)
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(ApiToken)
    private readonly apiTokenRepository: Repository<ApiToken>,
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

    const workspaceId = await this.findWorkspaceWithFewestChatbots();
    if (!workspaceId) {
      throw new Error('No active workspaces available');
    }

    const workspace = await this.workspaceRepository.findOneBy({
      id: workspaceId,
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    createUserDto['username'] = generateUniqueString('user');
    createUserDto.password = hashPassword(password);
    const newUser = this.userRepository.create({
      ...createUserDto,
      workspace,
    });
    await this.userRepository.save(newUser);
    return plainToInstance(User, newUser);
  }

  private async findWorkspaceWithFewestChatbots() {
    const result = await this.workspaceRepository
      .createQueryBuilder('workspace')
      .leftJoin('workspace.users', 'users')
      .leftJoin('users.chatbots', 'chatbots')
      .select('workspace.id', 'id')
      .addSelect('COUNT(chatbots.id)', 'chatbotCount')
      .where('workspace.status = :status', { status: 'active' })
      .groupBy('workspace.id')
      .orderBy('chatbotCount', 'ASC')
      .limit(1)
      .getRawOne();

    return result?.id || null;
  }

  async getApiTokenForUser(id: string) {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
      relations: {
        api_token: true,
      }
    });
    if (user?.api_token?.token) {
      return {
        token: user?.api_token?.token,
      };
    }
    const token = await this.getTokenWithFewestUsers();

    if (!token) {
      throw new Error('No available API tokens found');
    }
    const result = await this.userRepository
      .createQueryBuilder()
      .update(User)
      .set({ api_token: token })
      .where('id = :id', { id })
      .execute();

    if (result.affected === 0) {
      throw new Error('User not found or update failed');
    }

    return token;
  }

  private async getTokenWithFewestUsers() {
    const result = await this.apiTokenRepository
      .createQueryBuilder('api_tokens')
      .leftJoin('users', 'u', 'u.token_id = api_tokens.id')
      .where('api_tokens.status = :status', { status: 'active' })
      .groupBy('api_tokens.id')
      .orderBy('COUNT(u.id)', 'ASC')
      .limit(1)
      .select('api_tokens.*')
      .getRawOne();

    return result || null;
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
      // relations: {
      //   api_token: true,
      // },
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
