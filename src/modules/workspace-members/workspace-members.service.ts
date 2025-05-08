import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  WorkspaceMember,
} from './entities/workspace-member.entity';
import { User } from '@modules/users/entities/user.entity';
import { Workspace } from '@modules/workspaces/entities/workspace.entity';
import { UserSubscriptions } from '@modules/user-subscriptions/entities/user-subscriptions.entity';
import { AddMemberDto } from './dto/add-member.dto';
import { EditMemberDto } from './dto/edit-member.dto';

@Injectable()
export class WorkspaceMembersService {
  constructor(
    @InjectRepository(WorkspaceMember)
    private workspaceMembersRepository: Repository<WorkspaceMember>,
    @InjectRepository(Workspace)
    private workspacesRepository: Repository<Workspace>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAllMember(workspaceId: string, userId: string) {
    const workspace = await this.workspacesRepository.findOne({
      where: { id: workspaceId },
    });
    if (!workspace) {
      throw new NotFoundException('Workspace không tồn tại');
    }
    const members = await this.workspaceMembersRepository.find({
      where: {
        user_manager_id: userId,
        workspace: {
          id: workspaceId,
        },
      },
      relations: ['workspace', 'user'],
      select: {
        role: true,
        joined_at: true,
        created_at: true,
        updated_at: true,
        user: {
          id: true,
          fullname: true,
          email: true,
          username: true,
        },
        workspace: {
          id: true,
          workspace_name: true,
        },
      },
    });
    return members;
  }

  async addMember(
    userId: string,
    workspaceId: string,
    addMemberDto: AddMemberDto,
  ) {
    // Kiểm tra workspace tồn tại
    const workspace = await this.workspacesRepository.findOne({
      where: { id: workspaceId },
    });
    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    // Kiểm tra user tồn tại
    const user = await this.usersRepository.findOne({
      where: { email: addMemberDto.email },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Kiểm tra xem user đã là thành viên chưa
    const existingMember = await this.workspaceMembersRepository.findOne({
      where: {
        workspace: { id: workspaceId },
        user: { email: addMemberDto.email },
        user_manager_id: userId,
      },
    });
    if (existingMember) {
      throw new BadRequestException(
        'The user is already a member of the workspace',
      );
    }

    // Thêm thành viên
    const newMember = this.workspaceMembersRepository.create({
      workspace: { id: workspaceId },
      user: { id: user.id },
      role: addMemberDto.role,
      user_manager_id: userId,
      joined_at: new Date(),
      created_at: new Date(),
    });

    return this.workspaceMembersRepository.save(newMember);
  }

  async updateMemberRole(
    workspaceId: string,
    userId: string,
    editMemberDto: EditMemberDto,
  ) {
    // Kiểm tra thành viên tồn tại
    const membership = await this.workspaceMembersRepository.findOne({
      where: {
        workspace: { id: workspaceId },
        user: { id: editMemberDto.userId },
        user_manager_id: userId,
      },
    });
    if (!membership) {
      throw new NotFoundException('Member does not exist in the workspace');
    }

    // Cập nhật vai trò
    membership.role = editMemberDto.role;
    membership.updated_at = new Date();
    return this.workspaceMembersRepository.save(membership);
  }

  async removeMember(
    workspaceId: string,
    userId: string,
    currentUserId: string,
  ) {
    // Kiểm tra thành viên tồn tại
    const membership = await this.workspaceMembersRepository.findOne({
      where: {
        workspace: { id: workspaceId },
        user: { id: currentUserId },
        user_manager_id: userId,
      },
    });
    if (!membership) {
      throw new NotFoundException('Thành viên không tồn tại trong workspace');
    }

    // Không cho phép xóa chính mình
    if (userId === currentUserId) {
      throw new BadRequestException('Không thể xóa chính bạn khỏi workspace');
    }

    // Xóa thành viên
    await this.workspaceMembersRepository.delete({
      workspace: { id: workspaceId },
      user: { id: currentUserId },
      user_manager_id: userId,
    });
    return { message: 'Xóa thành viên thành công' };
  }
}
