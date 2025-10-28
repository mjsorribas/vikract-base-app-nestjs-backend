import { PartialType } from '@nestjs/mapped-types';
import { CreateApiKeyDto } from './create-api-key.dto';
import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateApiKeyDto extends PartialType(CreateApiKeyDto) {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}