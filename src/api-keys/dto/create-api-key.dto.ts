import {
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsDateString,
  IsBoolean,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateApiKeyDto {
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: Date;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  scopes?: string[];

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}