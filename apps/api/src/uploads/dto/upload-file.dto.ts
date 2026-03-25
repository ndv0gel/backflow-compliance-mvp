import { FileAssetKind } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UploadFileDto {
  @IsEnum(FileAssetKind)
  kind!: FileAssetKind;

  @IsOptional()
  @IsString()
  deviceId?: string;
}
