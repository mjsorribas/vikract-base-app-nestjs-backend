import { Controller, Get, Param, Query } from '@nestjs/common';
import { TagsService } from './tags.service';

@Controller('tags')
export class TagsPublicController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  findActive(@Query('lang') languageCode?: string) {
    return this.tagsService.findActive(languageCode);
  }

  @Get(':slug')
  findBySlug(
    @Param('slug') slug: string,
    @Query('lang') languageCode?: string,
  ) {
    return this.tagsService.findBySlug(slug, languageCode);
  }
}
