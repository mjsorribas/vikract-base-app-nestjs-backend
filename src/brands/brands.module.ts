import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BrandsService } from './brands.service';
import { AdminBrandsController } from './controllers/admin-brands.controller';
import { PublicBrandsController } from './controllers/public-brands.controller';
import { Brand } from './entities/brand.entity';
import { ProductCategory } from '../product-categories/entities/product-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Brand, ProductCategory])],
  controllers: [AdminBrandsController, PublicBrandsController],
  providers: [BrandsService],
  exports: [BrandsService],
})
export class BrandsModule {}
