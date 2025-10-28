import {
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class TagTranslationDto {
  @IsNotEmpty()
  name: string;

  @IsOptional()
  description?: string;

  @IsUUID()
  languageId: string;
}

export class CreateTagDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TagTranslationDto)
  translations: TagTranslationDto[];
}