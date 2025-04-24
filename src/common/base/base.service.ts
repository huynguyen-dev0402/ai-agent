import {
  PaginatedResponseDto,
  PaginationParamsDto,
} from './../dto/pagination.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { BaseEntity } from '../entities/base.entity';
import { DeepPartial, FindOneOptions, Repository } from 'typeorm';

@Injectable()
export abstract class BaseService<T extends BaseEntity> {
  constructor(private readonly repository: Repository<T>) {}

  async findAll(
    paginationParams: PaginationParamsDto,
    options?: FindOneOptions<T>,
  ): Promise<PaginatedResponseDto<T>> {
    const { page = 1, limit = 10 } = paginationParams;
    const skip = (page - 1) * limit;
    const [data, totalCount] = await this.repository.findAndCount({
      skip,
      take: limit,
      ...options, // Cho phép truyền thêm các điều kiện find (where, relations, order, ...)
    });

    return new PaginatedResponseDto(data, page, limit, totalCount);
  }

  async findOne(options: FindOneOptions<T>): Promise<T | null> {
    return this.repository.findOne(options);
  }

  async findOneOrFail(options: FindOneOptions): Promise<T> {
    const entity = await this.repository.findOne(options);
    if (!entity) {
      throw new NotFoundException(
        `${this.repository.metadata.targetName} not found`,
      );
    }
    return entity;
  }

  async findById(id: string, options?: FindOneOptions<T>): Promise<T | null> {
    const findOptions: FindOneOptions<T> = {
      ...options,
      //Giữ nguyên các giá trị options nếu có (select, relations, where, ...)
      where: { ...(options?.where || {}), id: id as any },
      //Giữ nguyên giá trị where nếu có, nếu không có trả về {} và gán thêm id
    };
    return this.repository.findOne(findOptions);
  }

  async findByIdOrFail(id: string, options?: FindOneOptions<T>): Promise<T> {
    const entity = await this.findById(id, options);
    if (!entity) {
      throw new NotFoundException(
        `${this.repository.metadata.targetName} not found`,
      );
    }
    return entity;
  }

  async create(createDto: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create(createDto);
    return this.repository.save(entity);
  }

  async update(id: string, updateDto: DeepPartial<T>): Promise<T> {
    // Kiểm tra sự tồn tại trước khi cập nhật
    const entity = await this.findByIdOrFail(id);
    // Merge dữ liệu mới vào entity hiện có
    this.repository.merge(entity, updateDto);
    // Lưu lại entity đã cập nhật
    // Lưu ý: Cần xử lý các quan hệ (relations) nếu có trong updateDto
    return this.repository.save(entity);
  }

  async remove(id: string): Promise<void> {
    const result = await this.repository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(
        `${this.repository.metadata.targetName} with ID: ${id} not found`,
      );
    }
  }
}
