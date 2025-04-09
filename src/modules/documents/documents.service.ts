import { Injectable } from '@nestjs/common';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { GetDocumentDto } from './dto/get-document.dto';

@Injectable()
export class DocumentsService {
  create(createDocumentDto: CreateDocumentDto) {
    return 'This action adds a new document';
  }

  uploadFileToKnowledge(createDocumentDto: CreateDocumentDto) {
    return 'This action adds a new document';
  }

  async getListDocumentForUser(
    resourceId: string,
    getDocumentDto: GetDocumentDto,
  ) {
    try {
      const response = await fetch(
        'https://api.coze.com/open_api/knowledge/document/list',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${getDocumentDto.api_token}`,
            'Content-Type': 'application/json',
            'Agw-Js-Conv': 'str',
          },
          body: JSON.stringify({
            dataset_id: getDocumentDto.external_resource_id,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          `Coze API error ${response.status}: ${JSON.stringify(data)}`,
        );
      }

      return data;
    } catch (error) {
      console.error('Error calling Coze document/list:', error);
      throw error;
    }
  }

  async getListImagesForUser(
    resourceId: string,
    getDocumentDto: GetDocumentDto,
  ) {
    const url = new URL(
      `https://api.coze.com/v1/datasets/${getDocumentDto.external_resource_id}/images`,
    );
    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${getDocumentDto.api_token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          `Coze API error ${response.status}: ${JSON.stringify(data)}`,
        );
      }

      return data;
    } catch (error) {
      console.error('Error fetching dataset images from Coze:', error);
      throw error;
    }
  }

  findAll() {
    return `This action returns all documents`;
  }

  findOne(id: number) {
    return `This action returns a #${id} document`;
  }

  update(id: number, updateDocumentDto: UpdateDocumentDto) {
    return `This action updates a #${id} document`;
  }

  remove(id: number) {
    return `This action removes a #${id} document`;
  }
}
