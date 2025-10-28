import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { ArticleStatus } from '../common/enums';
import { Public } from '../auth/decorators/public.decorator';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  create(@Body() createArticleDto: CreateArticleDto) {
    return this.articlesService.create(createArticleDto);
  }

  @Get()
  findAll(
    @Query('status') status?: ArticleStatus,
    @Query('blogId') blogId?: string,
    @Query('authorId') authorId?: string,
    @Query('lang') languageCode?: string,
  ) {
    return this.articlesService.findAll({
      status,
      blogId,
      authorId,
      languageCode,
    });
  }

  @Get('published')
  @Public()
  findPublished(@Query('lang') languageCode?: string) {
    return this.articlesService.findPublished(languageCode);
  }

  @Get('slug/:slug')
  @Public()
  findBySlug(
    @Param('slug') slug: string,
    @Query('lang') languageCode?: string,
  ) {
    return this.articlesService.findBySlug(slug, languageCode);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.articlesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateArticleDto: UpdateArticleDto,
  ) {
    return this.articlesService.update(id, updateArticleDto);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: ArticleStatus,
  ) {
    return this.articlesService.updateStatus(id, status);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.articlesService.remove(id);
  }
}
