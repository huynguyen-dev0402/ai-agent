import { DeepPartial } from 'typeorm';
import { BaseEntity } from '../entities/base.entity';
import { BaseService } from './base.service';
import { Body, Get, Param, ParseUUIDPipe, Post, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { PaginationParamsDto } from '../dto/pagination.dto';

// Lưu ý: Controller này là abstract và cần được kế thừa.
// Các decorator như @ApiTags, @ApiOperation, @ApiResponse (Swagger)
// và @UseGuards, @Roles (Auth) nên được thêm vào controller cụ thể kế thừa từ nó.
// Các DTO (CreateDto, UpdateDto) cũng cần được định nghĩa và sử dụng trong controller cụ thể.
// T: Entity (Model) thật (VD: UserEntity, ...)
// CreateDto: Kiểu dữ liệu cho create (VD: CreateUserDto, ...)
// UpdateDto: Kiểu dữ liệu cho update (VD: UpdateUserDto, ...)
// DeepPartial: Cho phép truyền vào object không cần đầy đủ các field dùng trong create, update

export abstract class BaseController<
  T extends BaseEntity,
  CreateDto extends DeepPartial<T>, // Placeholder for actual Create DTO
  UpdateDto extends DeepPartial<T>, // Placeholder for actual Update DTO
> {
  constructor(private readonly baseService: BaseService<T>) {}

  @Post()
  @UsePipes(new ValidationPipe()) // Áp dụng validation pipe cho body
  create(@Body() createDto: CreateDto) {
    // Cần đảm bảo CreateDto được định nghĩa đúng
    return this.baseService.create(createDto);
  }

  @Get()
  findAll(@Query() paginationParams:PaginationParamsDto){
    return this.baseService.findAll(paginationParams);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id:string){
    // Sử dụng ParseUUIDPipe nếu ID là UUID
    // Hoặc ParseIntPipe nếu ID là number
    return this.baseService.findByIdOrFail(id);
  }
}
