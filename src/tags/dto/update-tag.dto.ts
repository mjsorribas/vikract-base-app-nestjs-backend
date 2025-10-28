import { PartialType } from '@nestjs/mapped-types';
import { CreateTagDto } from './create-tag.dto';
import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateTagDto extends PartialType(CreateTagDto) {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}