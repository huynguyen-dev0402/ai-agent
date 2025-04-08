import { Injectable } from '@nestjs/common';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Resource } from './entities/resource.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ResourcesService {
  constructor(@InjectRepository(Resource) private readonly resourceRepository:Repository<Resource>){}
  async create(createResourceDto: CreateResourceDto) {
    const response = await fetch('https://api.coze.com/v1/datasets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${createResourceDto.api_token}`,
      },
      body: JSON.stringify({
        name: createResourceDto.resource_name,
        description: createResourceDto.description,
        space_id: createResourceDto.external_space_id,
        format_type: createResourceDto.external_space_id,
        file_id:createResourceDto.external_icon_id,
      }),
    });

    return 'This action adds a new resource';
  }

  findAll() {
    return `This action returns all resources`;
  }

  findOne(id: number) {
    return `This action returns a #${id} resource`;
  }

  update(id: number, updateResourceDto: UpdateResourceDto) {
    return `This action updates a #${id} resource`;
  }

  remove(id: number) {
    return `This action removes a #${id} resource`;
  }
}
