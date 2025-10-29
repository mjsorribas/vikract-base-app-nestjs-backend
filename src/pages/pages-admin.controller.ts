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
  Request,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PagesService } from './pages.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { Page, PageStatus } from './entities/page.entity';
import { PageResponseDto, PageMenuDto } from './dto/page-response.dto';
import { JwtAuthGuard } from '../auths/jwt-auth.guard';

@Controller('admin/pages')
@UseGuards(JwtAuthGuard)
export class PagesAdminController {
  constructor(private readonly pagesService: PagesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createPageDto: CreatePageDto,
    @Request() req,
  ): Promise<PageResponseDto> {
    const page = await this.pagesService.create(createPageDto, req.user.id);
    return new PageResponseDto(page);
  }

  @Get()
  async findAll(
    @Query('includeInactive') includeInactive?: string,
    @Query('status') status?: PageStatus,
  ): Promise<PageResponseDto[]> {
    let pages: Page[];

    if (status) {
      pages = await this.pagesService.findByStatus(status);
    } else {
      const includeInactiveFlag = includeInactive === 'true';
      pages = await this.pagesService.findAll(includeInactiveFlag);
    }

    return pages.map((page) => new PageResponseDto(page));
  }

  @Get('hierarchy')
  async getHierarchy(): Promise<PageResponseDto[]> {
    const pages = await this.pagesService.getPageHierarchy();
    return pages.map((page) => new PageResponseDto(page));
  }

  @Get('menu/:type')
  async getMenuStructure(
    @Param('type') type: 'home' | 'footer',
  ): Promise<PageMenuDto[]> {
    return await this.pagesService.getMenuStructure(type);
  }

  @Get('parent/:parentId')
  async findByParent(
    @Param('parentId', ParseUUIDPipe) parentId: string,
  ): Promise<PageResponseDto[]> {
    const pages = await this.pagesService.findByParent(parentId);
    return pages.map((page) => new PageResponseDto(page));
  }

  @Get('root')
  async findRootPages(): Promise<PageResponseDto[]> {
    const pages = await this.pagesService.findRootPages();
    return pages.map((page) => new PageResponseDto(page));
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PageResponseDto> {
    const page = await this.pagesService.findOne(id);
    return new PageResponseDto(page);
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string): Promise<PageResponseDto> {
    const page = await this.pagesService.findBySlug(slug);
    return new PageResponseDto(page);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePageDto: UpdatePageDto,
  ): Promise<PageResponseDto> {
    const page = await this.pagesService.update(id, updatePageDto);
    return new PageResponseDto(page);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.pagesService.remove(id);
  }
}
