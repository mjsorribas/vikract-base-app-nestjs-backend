import {
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsDecimal,
  Min,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateProductMediaDto } from './create-product-media.dto';

export class CreateProductDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  productCode: string;

  @IsNotEmpty()
  slug: string;

  @IsNotEmpty()
  longDescription: string;

  @IsNotEmpty()
  shortDescription: string;

  @IsDecimal()
  @Min(0)
  salePrice: number;

  @IsOptional()
  @IsDecimal()
  @Min(0)
  offerPrice?: number;

  @IsOptional()
  @IsBoolean()
  isOfferActive?: boolean;

  @IsDecimal()
  @Min(0)
  purchasePrice: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  availableStock?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stockLimit?: number;

  @IsOptional()
  @IsDecimal()
  @Min(0)
  weight?: number;

  @IsOptional()
  size?: string;

  @IsOptional()
  @IsBoolean()
  hasShipping?: boolean;

  @IsOptional()
  @IsBoolean()
  hasPickup?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  mainImageUrl?: string;

  @IsOptional()
  mainVideoUrl?: string;

  @IsOptional()
  thumbnailSmall?: string;

  @IsOptional()
  thumbnailMedium?: string;

  @IsOptional()
  thumbnailLarge?: string;

  @IsNotEmpty()
  categoryId: string;

  @IsOptional()
  brandId?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductMediaDto)
  media?: CreateProductMediaDto[];
}
