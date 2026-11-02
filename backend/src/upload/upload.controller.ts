import {
  BadRequestException,
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { randomBytes } from 'crypto';
import type { Express } from 'express';

const allowedImageTypes: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

@Controller('upload')
export class UploadController {
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_req, file, cb) => {
          const extension = allowedImageTypes[file.mimetype];
          cb(null, `${randomBytes(16).toString('hex')}${extension}`);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024,
        files: 1,
      },
      fileFilter: (_req, file, cb) => {
        if (!allowedImageTypes[file.mimetype]) {
          cb(
            new BadRequestException(
              'Only JPEG, PNG, and WebP image uploads are allowed',
            ),
            false,
          );
          return;
        }
        cb(null, true);
      },
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('A valid image file is required');
    }

    return {
      url: `/uploads/${file.filename}`,
    };
  }
}
