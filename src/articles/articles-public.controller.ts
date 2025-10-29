import { Controller, Get, Param, Query } from '@nestjs/common';
import { ArticlesService } from './articles.service';

@Controller('articles')
export class ArticlesPublicController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  findPublished(@Query('lang') languageCode?: string) {
    return this.articlesService.findPublished(languageCode);
  }

  @Get(':slug')
  findBySlug(
    @Param('slug') slug: string,
    @Query('lang') languageCode?: string,
  ) {
    return this.articlesService.findBySlug(slug, languageCode);
  }
}
