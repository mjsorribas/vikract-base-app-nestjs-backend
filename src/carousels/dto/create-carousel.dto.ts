import {
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateCarouselSlideDto } from './create-carousel-slide.dto';

export class CreateCarouselDto {
  @IsNotEmpty()
  name: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  autoplayDelay?: number;

  @IsOptional()
  @IsBoolean()
  showIndicators?: boolean;

  @IsOptional()
  @IsBoolean()
  showNavigation?: boolean;

  @IsOptional()
  articleId?: string;

  @IsOptional()
  pageId?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCarouselSlideDto)
  slides?: CreateCarouselSlideDto[];
}
