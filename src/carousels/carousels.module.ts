import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarouselsService } from './carousels.service';
import { CarouselsAdminController } from './carousels-admin.controller';
import { CarouselsPublicController } from './carousels-public.controller';
import { Carousel } from './entities/carousel.entity';
import { CarouselSlide } from './entities/carousel-slide.entity';
import { Article } from '../articles/entities/article.entity';
import { Page } from '../pages/entities/page.entity';
import { ApiKeysModule } from '../api-keys/api-keys.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Carousel, CarouselSlide, Article, Page]),
    ApiKeysModule,
  ],
  controllers: [CarouselsAdminController, CarouselsPublicController],
  providers: [CarouselsService],
  exports: [CarouselsService],
})
export class CarouselsModule {}
