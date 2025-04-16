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
import { ApiToken, TokenStatus } from '../api-tokens/entities/api-token.entity';

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

  async getApiTokenForUser(id: string): Promise<string> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: { api_token: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.api_token?.token) {
      return user.api_token.token;
    }

    const apiToken = await this.apiTokenRepository.findOne({
      where: {
        id: '1',
        status: TokenStatus.ACTIVE,
      },
    });

    if (!apiToken) {
      throw new NotFoundException('Api token not found');
    }

    await this.userRepository.update(id, { api_token: { id: apiToken.id } });

    return apiToken.token;
  }

  async findAllResourceForUser(id: string) {
    const resources = await this.userRepository.findOne({
      where: {
        id,
      },
      relations: {
        prompts: true,
        resources: true,
      },
      select: {
        id: true,
        resources: true,
        prompts: true,
      },
    });
    return resources;
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

  async updatePassword(email: string, password: string) {
    const user = await this.userRepository.findOne({
      where: {
        email,
      },
    });
    if (!user) {
      return false;
    }

    const data = await this.userRepository.update(user.id, {
      password: password,
    });
    if (!data.affected) {
      return false;
    }
    return true;
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
