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
import { readFile, unlink } from 'node:fs/promises';
import type { Express } from 'express';

const allowedImageTypes: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

/** Verify that the file bytes match the declared image MIME type. */
export function hasValidImageSignature(
  buffer: Buffer,
  mimeType: string,
): boolean {
  if (mimeType === 'image/jpeg') {
    return (
      buffer.length >= 3 &&
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff
    );
  }

  if (mimeType === 'image/png') {
    return (
      buffer.length >= 8 &&
      buffer.subarray(0, 8).equals(
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      )
    );
  }

  if (mimeType === 'image/webp') {
    return (
      buffer.length >= 12 &&
      buffer.toString('ascii', 0, 4) === 'RIFF' &&
      buffer.toString('ascii', 8, 12) === 'WEBP'
    );
  }

  return false;
}

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
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('A valid image file is required');
    }

    let signatureIsValid = false;
    try {
      const contents = await readFile(file.path);
      signatureIsValid = hasValidImageSignature(contents, file.mimetype);
    } catch {
      // Treat unreadable uploads as invalid and remove the temporary file.
    }

    if (!signatureIsValid) {
      await unlink(file.path).catch(() => undefined);
      throw new BadRequestException(
        'The uploaded file content does not match a supported image type',
      );
    }

    return {
      url: `/uploads/${file.filename}`,
    };
  }
}
