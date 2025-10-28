import { IsNotEmpty, IsOptional, IsUUID, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CategoryTranslationDto {
  @IsNotEmpty()
  name: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  seoTitle?: string;

  @IsOptional()
  seoDescription?: string;

  @IsOptional()
  seoKeywords?: string;

  @IsUUID()
  languageId: string;
}

export class CreateCategoryDto {
  @IsOptional()
  featuredImage?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CategoryTranslationDto)
  translations: CategoryTranslationDto[];
}