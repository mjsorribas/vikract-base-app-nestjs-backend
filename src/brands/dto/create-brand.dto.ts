import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsBoolean,
  IsNumber,
  IsArray,
  Min,
  MaxLength,
} from 'class-validator';

export class CreateBrandDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  slug: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @IsOptional()
  @IsUrl()
  websiteUrl?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  countryOfOrigin?: string;

  @IsOptional()
  @IsNumber()
  @Min(1800)
  foundedYear?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categoryIds?: string[];
}
