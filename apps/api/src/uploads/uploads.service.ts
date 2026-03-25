import { BadRequestException, Injectable } from '@nestjs/common';
import { FileAssetKind } from '@prisma/client';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { UploadFileDto } from './dto/upload-file.dto';

@Injectable()
export class UploadsService {
  constructor(
    private readonly storageService: StorageService,
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async uploadFile(
    file: Express.Multer.File,
    dto: UploadFileDto,
    userId: string,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    if (file.size > 10 * 1024 * 1024) {
      throw new BadRequestException('File exceeds 10MB upload limit');
    }

    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (
      (dto.kind === FileAssetKind.PHOTO ||
        dto.kind === FileAssetKind.SIGNATURE) &&
      !allowedImageTypes.includes(file.mimetype)
    ) {
      throw new BadRequestException(
        'Only JPEG, PNG, and WebP files are allowed for photos/signatures',
      );
    }

    const safeFileName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const objectKey = `${dto.kind.toLowerCase()}/${Date.now()}-${safeFileName}`;

    const uploaded = await this.storageService.uploadBuffer({
      objectKey,
      body: file.buffer,
      contentType: file.mimetype,
    });

    const createdFile = await this.prisma.fileAsset.create({
      data: {
        objectKey: uploaded.objectKey,
        url: uploaded.url,
        contentType: uploaded.contentType,
        sizeBytes: uploaded.sizeBytes,
        kind: dto.kind,
        deviceId: dto.deviceId,
        createdById: userId,
      },
    });

    await this.auditService.log({
      userId,
      actionType: 'file.upload',
      entityType: 'file_asset',
      entityId: createdFile.id,
      metadata: {
        kind: dto.kind,
        objectKey: uploaded.objectKey,
      },
    });

    return createdFile;
  }
}
