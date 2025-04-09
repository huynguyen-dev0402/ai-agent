import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as FormData from 'form-data';
import { Readable } from 'stream';

@Injectable()
export class UploadService {
  async uploadToCoze(file: Express.Multer.File): Promise<any> {
    try {
      const form = new FormData();
      form.append('file', Readable.from(file.buffer), {
        filename: file.originalname,
        contentType: file.mimetype,
      });

      const response = await fetch('https://api.coze.com/v1/files/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer pat_xjaE4w9AekUPUL2AxksFeiwcNa05fWUU8FCWYluaGfQKq6IicjmKzZJhYg0AlWXc`, // Thay bằng token thật
          ...form.getHeaders(), // rất quan trọng
        },
        body: form as any,
      });

      const text = await response.text();

      if (!response.ok) {
        throw new InternalServerErrorException(
          `Coze API error ${response.status}: ${text}`,
        );
      }

      return JSON.parse(text);
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to upload file to Coze API: ${error.message}`,
      );
    }
  }
}
