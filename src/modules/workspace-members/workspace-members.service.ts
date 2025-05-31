import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkspaceMember } from './entities/workspace-member.entity';
import { User, UserStatus } from '@modules/users/entities/user.entity';
import { Workspace } from '@modules/workspaces/entities/workspace.entity';
import { UserSubscriptions } from '@modules/user-subscriptions/entities/user-subscriptions.entity';
import { AddMemberDto } from './dto/add-member.dto';
import { EditMemberDto } from './dto/edit-member.dto';
import { hashPassword } from '@common/utils/hash-password/hashing.util';
import { generateUniqueString } from '@common/utils/generate-random/generate-username.util';

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

  async findAllMember(inviterId: string) {
    const members = await this.workspaceMembersRepository.find({
      where: {
        invited_by: inviterId,
      },
      relations: ['user'],
      select: {
        role: true,
        joined_at: true,
        created_at: true,
        updated_at: true,
        user: {
          id: true,
          email: true,
          username: true,
        },
      },
    });
    return members;
  }

  async addSubMember(
    inviterId: string,
    addMemberDto: AddMemberDto,
  ) {
    const { email, password } = addMemberDto;

    // 2. Kiểm tra email đã tồn tại chưa
    let user = await this.usersRepository.findOneBy({ email });
    if (user) {
      throw new BadRequestException('User đã là thành viên của workspace');
    } else {
      // Nếu user chưa tồn tại, tạo mới
      user = this.usersRepository.create({
        email,
        is_member: true,
        username: generateUniqueString('member'),
        password: hashPassword(password),
      });
      await this.usersRepository.save(user);
    }

    // 3. Thêm vào workspace_members
    await this.workspaceMembersRepository.insert({
      user_id: user.id,
      role: addMemberDto.role,
      invited_by: inviterId,
      joined_at: new Date(),
    });

    return true;
  }

  // async addMember(
  //   userId: string,
  //   workspaceId: string,
  //   addMemberDto: AddMemberDto,
  // ) {
  //   // 1. Lấy user theo email
  //   const user = await this.usersRepository.findOneBy({
  //     email: addMemberDto.email,
  //   });
  //   if (!user) {
  //     throw new NotFoundException('User not found');
  //   }

  //   // Kiểm tra xem user đã là thành viên chưa
  //   const existingMember = await this.workspaceMembersRepository.findOne({
  //     where: {
  //       workspace_id: workspaceId,
  //       user_id: user.id,
  //       user_manager_id: userId,
  //     },
  //   });
  //   if (existingMember) {
  //     throw new BadRequestException(
  //       'The user is already a member of the workspace',
  //     );
  //   }

  //   // 4. Tối ưu: sử dụng insert thay vì save
  //   await this.workspaceMembersRepository.insert({
  //     workspace_id: workspaceId,
  //     user_id: user.id,
  //     role: addMemberDto.role,
  //     user_manager_id: userId,
  //     joined_at: new Date(),
  //     created_at: new Date(),
  //   });

  //   return true;
  // }

  async updateMemberRole(
    workspaceId: string,
    userId: string,
    editMemberDto: EditMemberDto,
  ) {
    // // Kiểm tra thành viên tồn tại
    // const membership = await this.workspaceMembersRepository.findOne({
    //   where: {
    //     workspace: { id: workspaceId },
    //     user: { id: editMemberDto.userId },
    //     user_manager_id: userId,
    //   },
    // });
    // if (!membership) {
    //   throw new NotFoundException('Member does not exist in the workspace');
    // }
    // // Cập nhật vai trò
    // membership.role = editMemberDto.role;
    // membership.updated_at = new Date();
    // return this.workspaceMembersRepository.save(membership);
  }

  async removeMember(memberId: string, inviterId: string) {
    // Kiểm tra thành viên tồn tại
    const membership = await this.workspaceMembersRepository.findOne({
      where: {
        invited_by: inviterId,
        user_id: memberId,
      },
    });
    if (!membership) {
      throw new NotFoundException('Thành viên không tồn tại trong workspace');
    }

    // Không cho phép xóa chính mình
    if (inviterId === memberId) {
      throw new BadRequestException('Không thể xóa chính bạn khỏi workspace');
    }

    // Xóa thành viên
    await this.workspaceMembersRepository.delete({
      user_id: memberId,
      invited_by: inviterId,
    });

    await this.usersRepository.update(memberId, {
      is_member: false, 
      status: UserStatus.INACTIVE,
    });
    return { message: 'Xóa thành viên thành công' };
  }
}
