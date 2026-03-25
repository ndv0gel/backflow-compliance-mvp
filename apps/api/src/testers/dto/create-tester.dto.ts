import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateTesterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  @MaxLength(120)
  name!: string;

  @IsString()
  @MaxLength(60)
  certificationNumber!: string;

  @IsDateString()
  certificationExpiration!: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
