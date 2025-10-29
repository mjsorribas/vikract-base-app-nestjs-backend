import { Controller, Get, Param } from '@nestjs/common';
import { ProductCategoriesService } from './product-categories.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('categories')
@Controller('categories')
export class PublicCategoriesController {
  constructor(private readonly categoriesService: ProductCategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Get active product categories (public)' })
  @ApiResponse({ status: 200, description: 'List of active categories' })
  findActive() {
    return this.categoriesService.findActive();
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get category by slug (public)' })
  @ApiResponse({ status: 200, description: 'Category found' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiParam({ name: 'slug', description: 'Category slug' })
  findBySlug(@Param('slug') slug: string) {
    return this.categoriesService.findBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID (public)' })
  @ApiResponse({ status: 200, description: 'Category found' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  @ApiParam({ name: 'id', description: 'Category ID' })
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }
}
