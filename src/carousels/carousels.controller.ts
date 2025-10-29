import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CarouselsService } from './carousels.service';
import { CreateCarouselDto } from './dto/create-carousel.dto';
import { UpdateCarouselDto } from './dto/update-carousel.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('carousels')
@Controller('carousels')
export class CarouselsController {
  constructor(private readonly carouselsService: CarouselsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new carousel' })
  @ApiResponse({ status: 201, description: 'Carousel created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() createCarouselDto: CreateCarouselDto) {
    return this.carouselsService.create(createCarouselDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all carousels' })
  @ApiResponse({ status: 200, description: 'List of carousels' })
  @ApiQuery({
    name: 'active',
    required: false,
    description: 'Filter by active status',
  })
  findAll(@Query('active') active?: string) {
    if (active === 'true') {
      return this.carouselsService.findActive();
    }
    return this.carouselsService.findAll();
  }

  @Get('article/:articleId')
  @ApiOperation({ summary: 'Get carousels by article ID' })
  @ApiResponse({
    status: 200,
    description: 'List of carousels for the article',
  })
  @ApiParam({ name: 'articleId', description: 'Article ID' })
  findByArticle(@Param('articleId') articleId: string) {
    return this.carouselsService.findByArticle(articleId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get carousel by ID' })
  @ApiResponse({ status: 200, description: 'Carousel found' })
  @ApiResponse({ status: 404, description: 'Carousel not found' })
  @ApiParam({ name: 'id', description: 'Carousel ID' })
  findOne(@Param('id') id: string) {
    return this.carouselsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update carousel' })
  @ApiResponse({ status: 200, description: 'Carousel updated successfully' })
  @ApiResponse({ status: 404, description: 'Carousel not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({ name: 'id', description: 'Carousel ID' })
  update(
    @Param('id') id: string,
    @Body() updateCarouselDto: UpdateCarouselDto,
  ) {
    return this.carouselsService.update(id, updateCarouselDto);
  }

  @Patch(':id/reorder')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reorder slides in carousel' })
  @ApiResponse({ status: 200, description: 'Slides reordered successfully' })
  @ApiResponse({ status: 404, description: 'Carousel not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({ name: 'id', description: 'Carousel ID' })
  reorderSlides(
    @Param('id') id: string,
    @Body() slideOrders: { id: string; order: number }[],
  ) {
    return this.carouselsService.reorderSlides(id, slideOrders);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete carousel' })
  @ApiResponse({ status: 200, description: 'Carousel deleted successfully' })
  @ApiResponse({ status: 404, description: 'Carousel not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiParam({ name: 'id', description: 'Carousel ID' })
  remove(@Param('id') id: string) {
    return this.carouselsService.remove(id);
  }
}
