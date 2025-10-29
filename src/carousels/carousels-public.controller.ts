import { Controller, Get, Param } from '@nestjs/common';
import { CarouselsService } from './carousels.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('carousels')
@Controller('carousels')
export class CarouselsPublicController {
  constructor(private readonly carouselsService: CarouselsService) {}

  @Get()
  @ApiOperation({ summary: 'Get active carousels' })
  @ApiResponse({ status: 200, description: 'List of active carousels' })
  findActive() {
    return this.carouselsService.findActive();
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

  @Get('page/:pageId')
  @ApiOperation({ summary: 'Get carousels by page ID' })
  @ApiResponse({
    status: 200,
    description: 'List of carousels for the page',
  })
  @ApiParam({ name: 'pageId', description: 'Page ID' })
  findByPage(@Param('pageId') pageId: string) {
    return this.carouselsService.findByPage(pageId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get carousel by ID' })
  @ApiResponse({ status: 200, description: 'Carousel found' })
  @ApiResponse({ status: 404, description: 'Carousel not found' })
  @ApiParam({ name: 'id', description: 'Carousel ID' })
  findOne(@Param('id') id: string) {
    return this.carouselsService.findOne(id);
  }
}
