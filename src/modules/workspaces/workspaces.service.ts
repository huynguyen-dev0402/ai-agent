import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { Workspace } from './entities/workspace.entity';
import { In, Repository } from 'typeorm';

@Injectable()
export class WorkspacesService {
  constructor(
    @InjectRepository(Workspace)
    private readonly workspaceRepository: Repository<Workspace>,
  ) {}
  async create(createWorkspaceDto: CreateWorkspaceDto) {}

  async findAllWorkspacesByUserId(userId: string) {
    const workspaces = await this.workspaceRepository.find({
      where: {
        user: {
          id: userId,
        },
      },
    });
    if (!workspaces.length) {
      return false;
    }
    return workspaces;
  }

  async findWorkspaceByUserId(userId: string, id: string) {
    const workspace = await this.workspaceRepository.findOne({
      where: {
        id,
        user: {
          id: userId,
        },
      },
    });
    if (!workspace) {
      return false;
    }
    return workspace;
  }

  findAll() {
    return 'This action find all';
  }

  async findAllChatbotsByWorkspace(id: string) {
    const workspace = await this.workspaceRepository.findOne({
      where: {
        id,
      },
      relations: {
        chatbots: true,
      },
    });
    if (!workspace?.chatbots) {
      return false;
    }
    return workspace.chatbots;
  }

  async findAllChatbotsByMultiWorkspaces(ids: string[]) {
    const chatbots = await this.workspaceRepository.find({
      where: {
        id: In(ids),
      },
      relations: {
        chatbots: true,
      },
      select: {
        id: true,
        chatbots: true,
      },
    });
    return chatbots;
  }

  async findOne(id: string) {
    const workspace = await this.workspaceRepository.findOne({
      where: {
        id,
      },
    });
    if (!workspace) {
      return false;
    }
    return workspace;
  }

  update(id: number, updateWorkspaceDto: UpdateWorkspaceDto) {
    return `This action updates a #${id} workspace`;
  }

  remove(id: number) {
    return `This action removes a #${id} workspace`;
  }
}
