import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blog } from './entities/blog.entity';
import { User } from '../users/entities/user.entity';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { SlugGenerator } from '../common/utils/slug-generator';
import { SeoGenerator } from '../common/utils/seo-generator';

@Injectable()
export class BlogsService {
  constructor(
    @InjectRepository(Blog)
    private blogRepository: Repository<Blog>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createBlogDto: CreateBlogDto): Promise<Blog> {
    const { ownerId, ...blogData } = createBlogDto;
    
    // Get owner
    const owner = await this.userRepository.findOne({ where: { id: ownerId } });
    if (!owner) {
      throw new Error('Owner not found');
    }

    // Generate slug
    const baseSlug = SlugGenerator.generate(createBlogDto.name);
    const existingSlugs = await this.getExistingSlugs();
    const slug = SlugGenerator.generateUnique(createBlogDto.name, existingSlugs);

    // Generate SEO JSON-LD
    const seoJsonLd = SeoGenerator.generateJsonLd({
      title: blogData.seoTitle || blogData.name,
      description: blogData.seoDescription || blogData.description,
      type: 'WebPage',
    });

    const blog = this.blogRepository.create({
      ...blogData,
      slug,
      seoJsonLd,
      owner,
    });

    return this.blogRepository.save(blog);
  }

  async findAll(): Promise<Blog[]> {
    return this.blogRepository.find({
      relations: ['owner'],
      where: { deletedAt: null },
    });
  }

  async findActive(): Promise<Blog[]> {
    return this.blogRepository.find({
      relations: ['owner'],
      where: { isActive: true, deletedAt: null },
    });
  }

  async findOne(id: string): Promise<Blog> {
    return this.blogRepository.findOne({
      where: { id },
      relations: ['owner', 'articles'],
    });
  }

  async findBySlug(slug: string): Promise<Blog> {
    return this.blogRepository.findOne({
      where: { slug },
      relations: ['owner', 'articles'],
    });
  }

  async update(id: string, updateBlogDto: UpdateBlogDto): Promise<Blog> {
    const blog = await this.findOne(id);
    if (!blog) {
      throw new Error('Blog not found');
    }

    // Update slug if name changed
    if (updateBlogDto.name && updateBlogDto.name !== blog.name) {
      const existingSlugs = await this.getExistingSlugs(id);
      updateBlogDto['slug'] = SlugGenerator.generateUnique(updateBlogDto.name, existingSlugs);
    }

    // Update SEO JSON-LD
    if (updateBlogDto.name || updateBlogDto.seoTitle || updateBlogDto.seoDescription) {
      updateBlogDto['seoJsonLd'] = SeoGenerator.generateJsonLd({
        title: updateBlogDto.seoTitle || updateBlogDto.name || blog.name,
        description: updateBlogDto.seoDescription || updateBlogDto.description || blog.description,
        type: 'WebPage',
      });
    }

    await this.blogRepository.update(id, updateBlogDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.blogRepository.softDelete(id);
  }

  private async getExistingSlugs(excludeId?: string): Promise<string[]> {
    const query = this.blogRepository.createQueryBuilder('blog')
      .select('blog.slug')
      .where('blog.deletedAt IS NULL');
    
    if (excludeId) {
      query.andWhere('blog.id != :excludeId', { excludeId });
    }

    const blogs = await query.getMany();
    return blogs.map(blog => blog.slug);
  }
}
