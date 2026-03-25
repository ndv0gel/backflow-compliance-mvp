import { DeviceStatus } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';

export class CreateDeviceDto {
  @IsString()
  @MaxLength(64)
  deviceId!: string;

  @IsString()
  @MaxLength(64)
  serialNumber!: string;

  @IsString()
  @MaxLength(120)
  deviceType!: string;

  @IsString()
  @MaxLength(120)
  manufacturer!: string;

  @IsString()
  @MaxLength(120)
  model!: string;

  @IsDateString()
  installationDate!: string;

  @IsString()
  @MaxLength(255)
  locationAddress!: string;

  @IsString()
  @MaxLength(120)
  city!: string;

  @IsString()
  @Length(2, 2)
  state!: string;

  @IsString()
  @MaxLength(12)
  zip!: string;

  @IsString()
  @MaxLength(120)
  customerName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  customerContact?: string;

  @IsOptional()
  @IsEnum(DeviceStatus)
  status?: DeviceStatus;
}
