import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductCategoriesService } from './product-categories.service';
import { ProductCategoriesController } from './product-categories.controller';
import { PublicCategoriesController } from './public-categories.controller';
import { ProductCategory } from './entities/product-category.entity';
import { ApiKeysModule } from '../api-keys/api-keys.module';

@Module({
  imports: [TypeOrmModule.forFeature([ProductCategory]), ApiKeysModule],
  controllers: [ProductCategoriesController, PublicCategoriesController],
  providers: [ProductCategoriesService],
  exports: [ProductCategoriesService],
})
export class ProductCategoriesModule {}
