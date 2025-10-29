import { Controller, Get, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { PagesService } from './pages.service';
import { PublicPageResponseDto, PageMenuDto } from './dto/page-response.dto';

@Controller('pages')
export class PagesPublicController {
  constructor(private readonly pagesService: PagesService) {}

  @Get()
  async findPublished(): Promise<PublicPageResponseDto[]> {
    const pages = await this.pagesService.findPublished();
    return pages.map((page) => new PublicPageResponseDto(page));
  }

  @Get('menu/:type')
  async getMenuStructure(
    @Param('type') type: 'home' | 'footer',
  ): Promise<PageMenuDto[]> {
    return await this.pagesService.getMenuStructure(type);
  }

  @Get('root')
  async findRootPages(): Promise<PublicPageResponseDto[]> {
    const pages = await this.pagesService.findRootPages();
    const publishedPages = pages.filter((page) => page.status === 'published');
    return publishedPages.map((page) => new PublicPageResponseDto(page));
  }

  @Get('parent/:parentId')
  async findByParent(
    @Param('parentId') parentId: string,
  ): Promise<PublicPageResponseDto[]> {
    const pages = await this.pagesService.findByParent(parentId);
    const publishedPages = pages.filter((page) => page.status === 'published');
    return publishedPages.map((page) => new PublicPageResponseDto(page));
  }

  @Get(':slug')
  @HttpCode(HttpStatus.OK)
  async findBySlug(
    @Param('slug') slug: string,
  ): Promise<PublicPageResponseDto> {
    const page = await this.pagesService.findBySlug(slug, true);
    
    // Increment view count
    await this.pagesService.incrementViewCount(page.id);
    
    return new PublicPageResponseDto(page);
  }
}
