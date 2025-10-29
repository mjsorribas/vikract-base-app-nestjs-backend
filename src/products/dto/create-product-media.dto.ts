import { IsNotEmpty, IsOptional, IsNumber, IsIn } from 'class-validator';
import { MediaType } from '../entities/product-media.entity';

export class CreateProductMediaDto {
  @IsIn(Object.values(MediaType))
  type: MediaType;

  @IsNotEmpty()
  url: string;

  @IsOptional()
  thumbnailSmall?: string;

  @IsOptional()
  thumbnailMedium?: string;

  @IsOptional()
  thumbnailLarge?: string;

  @IsOptional()
  altText?: string;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}
