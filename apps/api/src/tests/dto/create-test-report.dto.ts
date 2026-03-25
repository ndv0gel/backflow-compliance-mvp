import { TestResult } from '@prisma/client';
import {
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTestReportDto {
  @IsString()
  @MaxLength(64)
  testId!: string;

  @IsString()
  deviceId!: string;

  @IsOptional()
  @IsString()
  testerId?: string;

  @IsOptional()
  @IsString()
  jobId?: string;

  @IsDateString()
  testDate!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  checkValve1!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  checkValve2!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  reliefValve!: number;

  @IsEnum(TestResult)
  testResult!: TestResult;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(8)
  @IsString({ each: true })
  photoFileIds?: string[];

  @IsOptional()
  @IsString()
  signatureFileId?: string;
}
