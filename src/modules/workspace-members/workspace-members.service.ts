import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  WorkspaceMember,
  WorkspaceMemberRole,
} from './entities/workspace-member.entity';
import { User } from '@modules/users/entities/user.entity';
import { Workspace } from '@modules/workspaces/entities/workspace.entity';
import { UserSubscriptions } from '@modules/user-subscriptions/entities/user-subscriptions.entity';
import { AddMemberDto } from './dto/add-member.dto';

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

  async addMember(workspaceId: string, addMemberDto: AddMemberDto) {
    // Kiểm tra workspace tồn tại
    const workspace = await this.workspacesRepository.findOne({
      where: { id: workspaceId },
    });
    if (!workspace) {
      throw new NotFoundException('Workspace không tồn tại');
    }

    // Kiểm tra user tồn tại
    const user = await this.usersRepository.findOne({
      where: { id: addMemberDto.userId },
    });
    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    // Kiểm tra xem user đã là thành viên chưa
    const existingMember = await this.workspaceMembersRepository.findOne({
      where: {
        workspace: { id: workspaceId },
        user: { id: addMemberDto.userId },
      },
    });
    if (existingMember) {
      throw new BadRequestException(
        'Người dùng đã là thành viên của workspace',
      );
    }

    // Thêm thành viên
    const newMember = this.workspaceMembersRepository.create({
      workspace: { id: workspaceId },
      user: { id: addMemberDto.userId },
      role: addMemberDto.role,
      joined_at: new Date(),
      created_at: new Date(),
    });

    return this.workspaceMembersRepository.save(newMember);
  }

  async updateMemberRole(workspaceId: string, addMemberDto:AddMemberDto) {
    // Kiểm tra thành viên tồn tại
    const membership = await this.workspaceMembersRepository.findOne({
      where: { workspace: { id: workspaceId }, user: { id: addMemberDto.userId } },
    });
    if (!membership) {
      throw new NotFoundException('Thành viên không tồn tại trong workspace');
    }

    // Cập nhật vai trò
    membership.role = addMemberDto.role;
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
      where: { workspace: { id: workspaceId }, user: { id: userId } },
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
      user: { id: userId },
    });
    return { message: 'Xóa thành viên thành công' };
  }
}
