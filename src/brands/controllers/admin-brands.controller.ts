import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { BrandsService } from '../brands.service';
import { CreateBrandDto } from '../dto/create-brand.dto';
import { UpdateBrandDto } from '../dto/update-brand.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Admin - Brands')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/brands')
export class AdminBrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new brand' })
  @ApiResponse({ status: 201, description: 'Brand created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() createBrandDto: CreateBrandDto) {
    return this.brandsService.create(createBrandDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all brands (including inactive)' })
  @ApiResponse({ status: 200, description: 'List of all brands' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll() {
    return this.brandsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get brand by ID' })
  @ApiResponse({ status: 200, description: 'Brand found' })
  @ApiResponse({ status: 404, description: 'Brand not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(@Param('id') id: string) {
    return this.brandsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update brand' })
  @ApiResponse({ status: 200, description: 'Brand updated successfully' })
  @ApiResponse({ status: 404, description: 'Brand not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  update(@Param('id') id: string, @Body() updateBrandDto: UpdateBrandDto) {
    return this.brandsService.update(id, updateBrandDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete brand' })
  @ApiResponse({ status: 200, description: 'Brand deleted successfully' })
  @ApiResponse({ status: 404, description: 'Brand not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  remove(@Param('id') id: string) {
    return this.brandsService.remove(id);
  }

  @Post(':id/categories')
  @ApiOperation({ summary: 'Add categories to brand' })
  @ApiResponse({ status: 200, description: 'Categories added successfully' })
  @ApiResponse({ status: 404, description: 'Brand or categories not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  addCategories(
    @Param('id') id: string,
    @Body() body: { categoryIds: string[] },
  ) {
    return this.brandsService.addCategories(id, body.categoryIds);
  }

  @Delete(':id/categories')
  @ApiOperation({ summary: 'Remove categories from brand' })
  @ApiResponse({ status: 200, description: 'Categories removed successfully' })
  @ApiResponse({ status: 404, description: 'Brand not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  removeCategories(
    @Param('id') id: string,
    @Body() body: { categoryIds: string[] },
  ) {
    return this.brandsService.removeCategories(id, body.categoryIds);
  }
}
