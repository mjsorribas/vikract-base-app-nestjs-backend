import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsUUID,
  IsInt,
  IsUrl,
  MinLength,
  MaxLength,
  IsDateString,
  Min,
} from 'class-validator';
import { PageStatus } from '../entities/page.entity';

export class CreatePageDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  subtitle?: string;

  @IsString()
  @MinLength(1)
  content: string;

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  slug: string;

  @IsOptional()
  @IsEnum(PageStatus)
  status?: PageStatus;

  // SEO Fields
  @IsOptional()
  @IsString()
  @MaxLength(255)
  seoTitle?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  seoDescription?: string;

  @IsOptional()
  @IsString()
  seoKeywords?: string;

  @IsOptional()
  @IsString()
  seoJsonLd?: string;

  // Menu Options
  @IsOptional()
  @IsBoolean()
  showInHomeMenu?: boolean;

  @IsOptional()
  @IsBoolean()
  showInFooterMenu?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  menuOrder?: number;

  // Media
  @IsOptional()
  @IsUrl()
  mainImage?: string;

  @IsOptional()
  @IsUrl()
  mainVideo?: string;

  // Publishing Options
  @IsOptional()
  @IsDateString()
  publishedAt?: string;

  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  // Hierarchical Structure
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
