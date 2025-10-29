import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { AdminProductsController } from './controllers/admin-products.controller';
import { PublicProductsController } from './controllers/public-products.controller';
import { Product } from './entities/product.entity';
import { ProductMedia } from './entities/product-media.entity';
import { ProductCategory } from '../product-categories/entities/product-category.entity';
import { ApiKeysModule } from '../api-keys/api-keys.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, ProductMedia, ProductCategory]),
    ApiKeysModule,
  ],
  controllers: [AdminProductsController, PublicProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
