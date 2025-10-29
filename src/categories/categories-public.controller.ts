import { Controller, Get, Param, Query } from '@nestjs/common';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesPublicController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findActive(@Query('lang') languageCode?: string) {
    return this.categoriesService.findActive(languageCode);
  }

  @Get(':slug')
  findBySlug(
    @Param('slug') slug: string,
    @Query('lang') languageCode?: string,
  ) {
    return this.categoriesService.findBySlug(slug, languageCode);
  }
}
