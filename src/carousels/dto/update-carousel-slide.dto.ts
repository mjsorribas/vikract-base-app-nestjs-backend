import { PartialType } from '@nestjs/mapped-types';
import { CreateCarouselSlideDto } from './create-carousel-slide.dto';

export class UpdateCarouselSlideDto extends PartialType(
  CreateCarouselSlideDto,
) {}
