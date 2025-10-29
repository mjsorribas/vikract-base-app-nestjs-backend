import { Controller, Get, Param } from '@nestjs/common';
import { BlogsService } from './blogs.service';

@Controller('blogs')
export class BlogsPublicController {
  constructor(private readonly blogsService: BlogsService) {}

  @Get()
  findActive() {
    return this.blogsService.findActive();
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.blogsService.findBySlug(slug);
  }
}
