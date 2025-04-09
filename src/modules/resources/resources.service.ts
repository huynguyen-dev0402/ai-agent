import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ExternalType,
  ExternalTypeName,
  Resource,
} from './entities/resource.entity';
import { Repository } from 'typeorm';
import { UsersService } from '../users/users.service';
import { Document } from '../documents/entities/document.entity';
import { UploadMultiDto } from '../documents/dto/upload-multi.dto';

@Injectable()
export class ResourcesService {
  constructor(
    @InjectRepository(Resource)
    private readonly resourceRepository: Repository<Resource>,
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    private readonly userService: UsersService,
  ) {}
  async createResourceForUser(
    userId: string,
    createResourceDto: CreateResourceDto,
  ) {
    const user = await this.userService.findOne(userId);
    try {
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
          format_type: createResourceDto.external_type_name == 'text' ? 0 : 2,
          file_id: createResourceDto.external_icon_id,
        }),
      });
      const data = await response.json();
      const dataResource = {
        name: createResourceDto.resource_name,
        external_resource_id: data.data.dataset_id,
        external_icon_url: createResourceDto.external_icon_id,
        external_type:
          createResourceDto.external_type_name == 'text'
            ? ExternalType.TEXT
            : ExternalType.IMAGE,
        external_type_name:
          createResourceDto.external_type_name == 'text'
            ? ExternalTypeName.TEXT
            : ExternalTypeName.IMAGE,
        description: createResourceDto.description,
        user_id: user.id,
        user,
      };
      const newResource = this.resourceRepository.create(dataResource);
      await this.resourceRepository.save(newResource);
      return newResource;
    } catch (error) {
      console.log('Error:', error);
    }
  }

  async uploadDocument(resourceId: string, uploadMultiDto: UploadMultiDto) {
    const resource = await this.resourceRepository.findOne({
      where: {
        id: resourceId,
      },
    });
    if (!resource) {
      return false;
    }
    // if (Number(resource.external_type) != Number(uploadMultiDto.format_type)) {
    //   return false;
    // }
    try {
      const response = await fetch(
        'https://api.coze.com/open_api/knowledge/document/create',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${uploadMultiDto.api_token}`,
            'Content-Type': 'application/json',
            'Agw-Js-Conv': 'str',
          },
          body: JSON.stringify({
            dataset_id: resource.external_resource_id,
            format_type: Number(uploadMultiDto.format_type),
            document_bases: [
              {
                name: uploadMultiDto.name_document,
                source_info: {
                  file_base64: uploadMultiDto.filebase_64,
                  file_type: uploadMultiDto.file_type,
                },
              },
            ],
            chunk_strategy: {
              separator: '\n\n',
              max_tokens: 800,
              remove_extra_spaces: false,
              remove_urls_emails: false,
              chunk_type: 1,
            },
          }),
        },
      );

      const text = await response.text();

      if (!response.ok) {
        throw new InternalServerErrorException(
          `Coze API error ${response.status}: ${text}`,
        );
      }

      const data = await JSON.parse(text);
      if (!data.document_infos) {
        throw new InternalServerErrorException(`Coze API error ${data}`);
      }

      const uploadData = {
        resource_id: resource.id,
        resource,
        external_document_id: data.document_infos[0].document_id,
        format_type: data.document_infos[0].format_type,
        document_name: data.document_infos[0].name,
        source_type: data.document_infos[0].source_type,
        type: uploadMultiDto.file_type,
      };
      const newDocument = this.documentRepository.create(uploadData);
      await this.documentRepository.save(newDocument);
      return data;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to create document in Coze: ${error.message}`,
      );
    }
  }

  async uploadImageDocument(
    resourceId: string,
    uploadMultiDto: UploadMultiDto,
  ) {
    const resource = await this.resourceRepository.findOne({
      where: {
        id: resourceId,
      },
    });
    if (!resource) {
      return false;
    }
    if (Number(resource.external_type) != Number(uploadMultiDto.format_type)) {
      return false;
    }
    try {
      const response = await fetch(
        'https://api.coze.com/open_api/knowledge/document/create',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${uploadMultiDto.api_token}`,
            'Content-Type': 'application/json',
            'Agw-Js-Conv': 'str',
          },
          body: JSON.stringify({
            dataset_id: resource.external_resource_id,
            format_type: Number(uploadMultiDto.format_type),
            document_bases: [
              {
                name: uploadMultiDto.name_image,
                source_info: {
                  source_file_id: uploadMultiDto.source_file_id,
                  document_source: uploadMultiDto.document_source,
                },
              },
            ],
          }),
        },
      );

      //console.log(BigInt(uploadMultiDto.source_file_id as BigInt));

      const text = await response.text();

      if (!response.ok) {
        throw new InternalServerErrorException(
          `Coze API error ${response.status}: ${text}`,
        );
      }

      const data = await JSON.parse(text);
      if (!data.document_infos) {
        throw new InternalServerErrorException(`Coze API error ${data}`);
      }

      console.log(data);

      const uploadData = {
        resource_id: resource.id,
        resource,
        external_document_id: data.document_infos[0].document_id,
        format_type: uploadMultiDto.format_type,
        document_name: data.document_infos[0].name,
        source_type: Number(resource.external_type),
        source_file_id: uploadMultiDto.source_file_id,
        type: uploadMultiDto.document_source == 5 ? 'image' : 'text',
      };
      // const newDocument = this.documentRepository.create(uploadData);
      // await this.documentRepository.save(newDocument);
      return data;
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to create document in Coze: ${error.message}`,
      );
    }
  }

  async findAllResourceForUser(userId: string) {
    const resources = await this.resourceRepository.find({
      where: {
        user_id: userId,
      },
      relations: {
        prompts: true,
        documents: true,
      },
    });
    return resources;
  }

  async findOneResourceForUser(userId: string, resourceId: string) {
    const resources = await this.resourceRepository.findOne({
      where: {
        id: resourceId,
        user_id: userId,
      },
      relations: {
        prompts: true,
        documents: true,
      },
    });
    return resources;
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
