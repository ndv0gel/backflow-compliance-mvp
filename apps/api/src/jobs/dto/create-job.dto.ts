import { IsDateString, IsString, MaxLength } from 'class-validator';

export class CreateJobDto {
  @IsString()
  @MaxLength(64)
  jobId!: string;

  @IsString()
  deviceId!: string;

  @IsDateString()
  scheduledDate!: string;

  @IsString()
  assignedTesterId!: string;
}
