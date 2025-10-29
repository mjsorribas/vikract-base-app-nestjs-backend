import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarouselsService } from './carousels.service';
import { CarouselsController } from './carousels.controller';
import { Carousel } from './entities/carousel.entity';
import { CarouselSlide } from './entities/carousel-slide.entity';
import { Article } from '../articles/entities/article.entity';
import { ApiKeysModule } from '../api-keys/api-keys.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Carousel, CarouselSlide, Article]),
    ApiKeysModule,
  ],
  controllers: [CarouselsController],
  providers: [CarouselsService],
  exports: [CarouselsService],
})
export class CarouselsModule {}
