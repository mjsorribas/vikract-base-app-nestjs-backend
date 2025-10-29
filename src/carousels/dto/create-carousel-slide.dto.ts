import {
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsUrl,
  IsBoolean,
  IsIn,
} from 'class-validator';

export class CreateCarouselSlideDto {
  @IsNotEmpty()
  imageUrl: string;

  @IsOptional()
  title?: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  @IsUrl()
  linkUrl?: string;

  @IsOptional()
  @IsIn(['_self', '_blank', '_parent', '_top'])
  linkTarget?: string;

  @IsNumber()
  order: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  altText?: string;
}
