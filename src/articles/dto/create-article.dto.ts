import {
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsArray,
  ValidateNested,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ArticleStatus } from '../../common/enums';

export class ArticleTranslationDto {
  @IsNotEmpty()
  title: string;

  @IsOptional()
  shortDescription?: string;

  @IsNotEmpty()
  content: string;

  @IsOptional()
  seoTitle?: string;

  @IsOptional()
  seoDescription?: string;

  @IsOptional()
  seoKeywords?: string;

  @IsUUID()
  languageId: string;
}

export class CreateArticleDto {
  @IsOptional()
  @IsEnum(ArticleStatus)
  status?: ArticleStatus;

  @IsOptional()
  featuredImage?: string;

  @IsOptional()
  @IsDateString()
  publishedAt?: Date;

  @IsOptional()
  @IsDateString()
  scheduledAt?: Date;

  @IsUUID()
  blogId: string;

  @IsUUID()
  authorId: string;

  @IsOptional()
  @IsUUID()
  editorId?: string;

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  categoryIds?: string[];

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  tagIds?: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ArticleTranslationDto)
  translations: ArticleTranslationDto[];
}