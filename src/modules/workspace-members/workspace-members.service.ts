import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkspaceMember } from './entities/workspace-member.entity';
import { User } from '@modules/users/entities/user.entity';
import { Workspace } from '@modules/workspaces/entities/workspace.entity';
import { UserSubscriptions } from '@modules/user-subscriptions/entities/user-subscriptions.entity';
import { AddMemberDto } from './dto/add-member.dto';
import { EditMemberDto } from './dto/edit-member.dto';
import { hashPassword } from '@common/utils/hash-password/hashing.util';

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

  async addSubMember(
    currentUserId: string,
    workspaceId: string,
    addMemberDto: AddMemberDto,
  ) {
    const { email, password } = addMemberDto;
    // 1. Kiểm tra workspace có tồn tại và currentUserId có quyền không
    const workspace = await this.workspacesRepository.findOne({
      where: { id: workspaceId },
    });
    if (!workspace) throw new NotFoundException('Workspace không tồn tại');

    // 2. Kiểm tra email đã tồn tại chưa
    const user = await this.usersRepository.findOneBy({ email });
    if (user) {
      throw new BadRequestException('User đã là thành viên của workspace');
    }
    // Nếu user chưa tồn tại, tạo mới
    const newUser = this.usersRepository.create({
      email,
      is_member: true,
      password: hashPassword(password),
    });
    await this.usersRepository.save(newUser);

    // 3. Thêm vào workspace_members
    await this.workspaceMembersRepository.insert({
      workspace_id: workspaceId,
      user_id: newUser.id,
      role: addMemberDto.role,
      user_manager_id: currentUserId,
      joined_at: new Date(),
      created_at: new Date(),
    });

    return { message: 'Thêm member thành công' };
  }

  async addMember(
    userId: string,
    workspaceId: string,
    addMemberDto: AddMemberDto,
  ) {
    // 1. Lấy user theo email
    const user = await this.usersRepository.findOneBy({
      email: addMemberDto.email,
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Kiểm tra xem user đã là thành viên chưa
    const existingMember = await this.workspaceMembersRepository.findOne({
      where: {
        workspace_id: workspaceId,
        user_id: user.id,
        user_manager_id: userId,
      },
    });
    if (existingMember) {
      throw new BadRequestException(
        'The user is already a member of the workspace',
      );
    }

    // 4. Tối ưu: sử dụng insert thay vì save
    await this.workspaceMembersRepository.insert({
      workspace_id: workspaceId,
      user_id: user.id,
      role: addMemberDto.role,
      user_manager_id: userId,
      joined_at: new Date(),
      created_at: new Date(),
    });

    return true;
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
        user: { id: userId },
        user_manager_id: currentUserId,
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
