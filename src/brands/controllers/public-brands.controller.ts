import { Controller, Get, Param } from '@nestjs/common';
import { BrandsService } from '../brands.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Public - Brands')
@Controller('public/brands')
export class PublicBrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active brands' })
  @ApiResponse({ status: 200, description: 'List of active brands' })
  findAll() {
    return this.brandsService.findPublicBrands();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get brand by slug' })
  @ApiResponse({ status: 200, description: 'Brand found' })
  @ApiResponse({ status: 404, description: 'Brand not found' })
  findBySlug(@Param('slug') slug: string) {
    return this.brandsService.findPublicBySlug(slug);
  }

  @Get('category/:categoryId')
  @ApiOperation({ summary: 'Get brands by category' })
  @ApiResponse({ status: 200, description: 'List of brands in category' })
  findByCategory(@Param('categoryId') categoryId: string) {
    return this.brandsService.findByCategory(categoryId);
  }
}
