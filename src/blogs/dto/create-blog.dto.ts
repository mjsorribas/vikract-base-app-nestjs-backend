import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateBlogDto {
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

  @IsOptional()
  featuredImage?: string;

  @IsUUID()
  ownerId: string;
}