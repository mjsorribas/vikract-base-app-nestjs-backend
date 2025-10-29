import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductsService } from '../products.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('products')
@Controller('products')
export class PublicProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Get available products (public)' })
  @ApiResponse({ status: 200, description: 'List of available products' })
  @ApiQuery({
    name: 'inStock',
    required: false,
    description: 'Filter by stock availability',
  })
  findAll(@Query('inStock') inStock?: string) {
    if (inStock === 'true') {
      return this.productsService.findInStock();
    }
    return this.productsService.findPublicProducts();
  }

  @Get('category/:categoryId')
  @ApiOperation({ summary: 'Get products by category (public)' })
  @ApiResponse({ status: 200, description: 'List of products in category' })
  @ApiParam({ name: 'categoryId', description: 'Category ID' })
  findByCategory(@Param('categoryId') categoryId: string) {
    return this.productsService.findPublicByCategory(categoryId);
  }

  @Get('brand/:brandId')
  @ApiOperation({ summary: 'Get products by brand (public)' })
  @ApiResponse({ status: 200, description: 'List of products by brand' })
  @ApiParam({ name: 'brandId', description: 'Brand ID' })
  findByBrand(@Param('brandId') brandId: string) {
    return this.productsService.findPublicByBrand(brandId);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get product by slug (public)' })
  @ApiResponse({ status: 200, description: 'Product found' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiParam({ name: 'slug', description: 'Product slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.productsService.findPublicBySlug(slug);
  }
}
