import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Page, PageStatus } from './entities/page.entity';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { PageMenuDto } from './dto/page-response.dto';

@Injectable()
export class PagesService {
  constructor(
    @InjectRepository(Page)
    private readonly pageRepository: Repository<Page>,
  ) {}

  async create(createPageDto: CreatePageDto, authorId: string): Promise<Page> {
    // Check if slug already exists
    const existingPage = await this.pageRepository.findOne({
      where: { slug: createPageDto.slug },
    });

    if (existingPage) {
      throw new ConflictException('A page with this slug already exists');
    }

    // Validate parent page exists if parentId is provided
    if (createPageDto.parentId) {
      const parentPage = await this.pageRepository.findOne({
        where: { id: createPageDto.parentId },
      });

      if (!parentPage) {
        throw new NotFoundException('Parent page not found');
      }

      // Prevent circular references (basic check)
      if (parentPage.parentId === createPageDto.parentId) {
        throw new BadRequestException('Cannot create circular page hierarchy');
      }
    }

    const page = this.pageRepository.create({
      ...createPageDto,
      authorId,
      publishedAt:
        createPageDto.status === PageStatus.PUBLISHED ? new Date() : null,
    });

    return await this.pageRepository.save(page);
  }

  async findAll(includeInactive = false): Promise<Page[]> {
    const queryBuilder = this.pageRepository
      .createQueryBuilder('page')
      .leftJoinAndSelect('page.author', 'author')
      .leftJoinAndSelect('page.parent', 'parent')
      .leftJoinAndSelect('page.children', 'children')
      .orderBy('page.menuOrder', 'ASC')
      .addOrderBy('page.createdAt', 'DESC');

    if (!includeInactive) {
      queryBuilder.where('page.isActive = :isActive', { isActive: true });
    }

    return await queryBuilder.getMany();
  }

  async findPublished(): Promise<Page[]> {
    return await this.pageRepository
      .createQueryBuilder('page')
      .leftJoinAndSelect('page.author', 'author')
      .leftJoinAndSelect('page.parent', 'parent')
      .leftJoinAndSelect('page.children', 'children')
      .where('page.status = :status', { status: PageStatus.PUBLISHED })
      .andWhere('page.isActive = :isActive', { isActive: true })
      .orderBy('page.menuOrder', 'ASC')
      .addOrderBy('page.publishedAt', 'DESC')
      .getMany();
  }

  async findByStatus(status: PageStatus): Promise<Page[]> {
    return await this.pageRepository
      .createQueryBuilder('page')
      .leftJoinAndSelect('page.author', 'author')
      .leftJoinAndSelect('page.parent', 'parent')
      .leftJoinAndSelect('page.children', 'children')
      .where('page.status = :status', { status })
      .andWhere('page.isActive = :isActive', { isActive: true })
      .orderBy('page.menuOrder', 'ASC')
      .addOrderBy('page.createdAt', 'DESC')
      .getMany();
  }

  async findHomeMenuPages(): Promise<Page[]> {
    return await this.pageRepository
      .createQueryBuilder('page')
      .where('page.showInHomeMenu = :showInHomeMenu', {
        showInHomeMenu: true,
      })
      .andWhere('page.status = :status', { status: PageStatus.PUBLISHED })
      .andWhere('page.isActive = :isActive', { isActive: true })
      .orderBy('page.menuOrder', 'ASC')
      .getMany();
  }

  async findFooterMenuPages(): Promise<Page[]> {
    return await this.pageRepository
      .createQueryBuilder('page')
      .where('page.showInFooterMenu = :showInFooterMenu', {
        showInFooterMenu: true,
      })
      .andWhere('page.status = :status', { status: PageStatus.PUBLISHED })
      .andWhere('page.isActive = :isActive', { isActive: true })
      .orderBy('page.menuOrder', 'ASC')
      .getMany();
  }

  async findByParent(parentId: string): Promise<Page[]> {
    return await this.pageRepository
      .createQueryBuilder('page')
      .leftJoinAndSelect('page.author', 'author')
      .leftJoinAndSelect('page.children', 'children')
      .where('page.parentId = :parentId', { parentId })
      .andWhere('page.isActive = :isActive', { isActive: true })
      .orderBy('page.menuOrder', 'ASC')
      .addOrderBy('page.createdAt', 'DESC')
      .getMany();
  }

  async findRootPages(): Promise<Page[]> {
    return await this.pageRepository
      .createQueryBuilder('page')
      .leftJoinAndSelect('page.author', 'author')
      .leftJoinAndSelect('page.children', 'children')
      .where('page.parentId IS NULL')
      .andWhere('page.isActive = :isActive', { isActive: true })
      .orderBy('page.menuOrder', 'ASC')
      .addOrderBy('page.createdAt', 'DESC')
      .getMany();
  }

  async findOne(id: string): Promise<Page> {
    const page = await this.pageRepository
      .createQueryBuilder('page')
      .leftJoinAndSelect('page.author', 'author')
      .leftJoinAndSelect('page.parent', 'parent')
      .leftJoinAndSelect('page.children', 'children')
      .where('page.id = :id', { id })
      .getOne();

    if (!page) {
      throw new NotFoundException('Page not found');
    }

    return page;
  }

  async findBySlug(slug: string, publishedOnly = false): Promise<Page> {
    const queryBuilder = this.pageRepository
      .createQueryBuilder('page')
      .leftJoinAndSelect('page.author', 'author')
      .leftJoinAndSelect('page.parent', 'parent')
      .leftJoinAndSelect('page.children', 'children')
      .where('page.slug = :slug', { slug });

    if (publishedOnly) {
      queryBuilder
        .andWhere('page.status = :status', { status: PageStatus.PUBLISHED })
        .andWhere('page.isActive = :isActive', { isActive: true });
    }

    const page = await queryBuilder.getOne();

    if (!page) {
      throw new NotFoundException('Page not found');
    }

    return page;
  }

  async incrementViewCount(id: string): Promise<void> {
    await this.pageRepository.increment({ id }, 'viewCount', 1);
  }

  async update(id: string, updatePageDto: UpdatePageDto): Promise<Page> {
    const page = await this.findOne(id);

    // Check slug uniqueness if slug is being updated
    if (updatePageDto.slug && updatePageDto.slug !== page.slug) {
      const existingPage = await this.pageRepository.findOne({
        where: { slug: updatePageDto.slug },
      });

      if (existingPage) {
        throw new ConflictException('A page with this slug already exists');
      }
    }

    // Validate parent page if parentId is being updated
    if (updatePageDto.parentId && updatePageDto.parentId !== page.parentId) {
      if (updatePageDto.parentId === id) {
        throw new BadRequestException('A page cannot be its own parent');
      }

      const parentPage = await this.pageRepository.findOne({
        where: { id: updatePageDto.parentId },
      });

      if (!parentPage) {
        throw new NotFoundException('Parent page not found');
      }

      // Prevent circular references
      const isCircular = await this.checkCircularReference(
        id,
        updatePageDto.parentId,
      );
      if (isCircular) {
        throw new BadRequestException('Cannot create circular page hierarchy');
      }
    }

    // Handle publishing
    if (
      updatePageDto.status === PageStatus.PUBLISHED &&
      page.status !== PageStatus.PUBLISHED
    ) {
      updatePageDto.publishedAt = new Date().toISOString();
    }

    Object.assign(page, updatePageDto);
    return await this.pageRepository.save(page);
  }

  async remove(id: string): Promise<void> {
    const page = await this.findOne(id);

    // Check if page has children
    const children = await this.findByParent(id);
    if (children.length > 0) {
      throw new BadRequestException('Cannot delete page that has child pages');
    }

    await this.pageRepository.remove(page);
  }

  async getPageHierarchy(): Promise<Page[]> {
    const allPages = await this.pageRepository
      .createQueryBuilder('page')
      .leftJoinAndSelect('page.children', 'children')
      .where('page.isActive = :isActive', { isActive: true })
      .orderBy('page.menuOrder', 'ASC')
      .addOrderBy('children.menuOrder', 'ASC')
      .getMany();

    // Build hierarchy (root pages with nested children)
    return allPages.filter((page) => !page.parentId);
  }

  async getMenuStructure(menuType: 'home' | 'footer'): Promise<PageMenuDto[]> {
    const field = menuType === 'home' ? 'showInHomeMenu' : 'showInFooterMenu';

    const pages = await this.pageRepository
      .createQueryBuilder('page')
      .select([
        'page.id',
        'page.title',
        'page.slug',
        'page.menuOrder',
        'page.parentId',
      ])
      .leftJoin('page.children', 'children')
      .addSelect([
        'children.id',
        'children.title',
        'children.slug',
        'children.menuOrder',
      ])
      .where(`page.${field} = :value`, { value: true })
      .andWhere('page.status = :status', { status: PageStatus.PUBLISHED })
      .andWhere('page.isActive = :isActive', { isActive: true })
      .orderBy('page.menuOrder', 'ASC')
      .addOrderBy('children.menuOrder', 'ASC')
      .getMany();

    return this.buildMenuTree(pages);
  }

  private async checkCircularReference(
    pageId: string,
    potentialParentId: string,
  ): Promise<boolean> {
    let currentParentId = potentialParentId;

    while (currentParentId) {
      if (currentParentId === pageId) {
        return true; // Circular reference found
      }

      const parentPage = await this.pageRepository.findOne({
        where: { id: currentParentId },
        select: ['parentId'],
      });

      if (!parentPage) break;
      currentParentId = parentPage.parentId;
    }

    return false;
  }

  private buildMenuTree(pages: Page[]): PageMenuDto[] {
    const pageMap = new Map<string, PageMenuDto>();
    const rootPages: PageMenuDto[] = [];

    // Create map of all pages
    pages.forEach((page) => {
      pageMap.set(page.id, {
        id: page.id,
        title: page.title,
        slug: page.slug,
        menuOrder: page.menuOrder,
        parentId: page.parentId,
        children: [],
      });
    });

    // Build tree structure
    pageMap.forEach((page) => {
      if (page.parentId && pageMap.has(page.parentId)) {
        pageMap.get(page.parentId).children.push(page);
      } else {
        rootPages.push(page);
      }
    });

    return rootPages;
  }
}
