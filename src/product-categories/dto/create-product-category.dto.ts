import { IsNotEmpty, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class CreateProductCategoryDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  slug: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  imageUrl?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}
