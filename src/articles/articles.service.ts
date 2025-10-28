import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Article } from './entities/article.entity';
import { ArticleTranslation } from './entities/article-translation.entity';
import { Blog } from '../blogs/entities/blog.entity';
import { User } from '../users/entities/user.entity';
import { Category } from '../categories/entities/category.entity';
import { Tag } from '../tags/entities/tag.entity';
import { Language } from '../languages/entities/language.entity';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { ArticleStatus } from '../common/enums';
import { SlugGenerator } from '../common/utils/slug-generator';
import { SeoGenerator } from '../common/utils/seo-generator';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private articleRepository: Repository<Article>,
    @InjectRepository(ArticleTranslation)
    private articleTranslationRepository: Repository<ArticleTranslation>,
    @InjectRepository(Blog)
    private blogRepository: Repository<Blog>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
    @InjectRepository(Language)
    private languageRepository: Repository<Language>,
  ) {}

  async create(createArticleDto: CreateArticleDto): Promise<Article> {
    const {
      blogId,
      authorId,
      editorId,
      categoryIds,
      tagIds,
      translations,
      ...articleData
    } = createArticleDto;

    // Get related entities
    const blog = await this.blogRepository.findOne({ where: { id: blogId } });
    const author = await this.userRepository.findOne({ where: { id: authorId } });
    const editor = editorId
      ? await this.userRepository.findOne({ where: { id: editorId } })
      : null;

    if (!blog || !author) {
      throw new Error('Blog or author not found');
    }

    // Get categories and tags if provided
    const categories = categoryIds
      ? await this.categoryRepository.find({ where: { id: In(categoryIds) } })
      : [];
    const tags = tagIds
      ? await this.tagRepository.find({ where: { id: In(tagIds) } })
      : [];

    // Get languages for translations
    const languageIds = translations.map((t) => t.languageId);
    const languages = await this.languageRepository.find({
      where: { id: In(languageIds) },
    });

    // Generate base slug from default language or first translation
    const defaultTranslation = translations[0];
    const existingSlugs = await this.getExistingSlugs();
    const slug = SlugGenerator.generateUnique(
      defaultTranslation.title,
      existingSlugs,
    );

    // Create article
    const article = this.articleRepository.create({
      ...articleData,
      slug,
      blog,
      author,
      editor,
      categories,
      tags,
    });

    const savedArticle = await this.articleRepository.save(article);

    // Create translations
    for (const translationDto of translations) {
      const language = languages.find((l) => l.id === translationDto.languageId);
      if (language) {
        const translationSlug = SlugGenerator.generate(translationDto.title);
        
        // Generate SEO data
        const seoJsonLd = SeoGenerator.generateJsonLd({
          title: translationDto.seoTitle || translationDto.title,
          description: translationDto.seoDescription || 
            SeoGenerator.generateDescription(translationDto.content),
          url: `/${translationSlug}`,
          image: savedArticle.featuredImage,
          author: author.firstName + ' ' + author.lastName,
          datePublished: savedArticle.publishedAt,
          dateModified: savedArticle.updatedAt,
          type: 'Article',
        });

        const translation = this.articleTranslationRepository.create({
          ...translationDto,
          slug: translationSlug,
          seoJsonLd,
          article: savedArticle,
          language,
        });
        await this.articleTranslationRepository.save(translation);
      }
    }

    return this.findOne(savedArticle.id);
  }

  async findAll(filters?: {
    status?: ArticleStatus;
    blogId?: string;
    authorId?: string;
    languageCode?: string;
  }): Promise<Article[]> {
    const query = this.articleRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.blog', 'blog')
      .leftJoinAndSelect('article.author', 'author')
      .leftJoinAndSelect('article.editor', 'editor')
      .leftJoinAndSelect('article.categories', 'categories')
      .leftJoinAndSelect('article.tags', 'tags')
      .leftJoinAndSelect('article.translations', 'translation')
      .leftJoinAndSelect('translation.language', 'language')
      .where('article.deletedAt IS NULL');

    if (filters?.status) {
      query.andWhere('article.status = :status', { status: filters.status });
    }

    if (filters?.blogId) {
      query.andWhere('blog.id = :blogId', { blogId: filters.blogId });
    }

    if (filters?.authorId) {
      query.andWhere('author.id = :authorId', { authorId: filters.authorId });
    }

    if (filters?.languageCode) {
      query.andWhere('language.code = :languageCode', {
        languageCode: filters.languageCode,
      });
    }

    return query.getMany();
  }

  async findPublished(languageCode?: string): Promise<Article[]> {
    return this.findAll({
      status: ArticleStatus.PUBLISHED,
      languageCode,
    });
  }

  async findOne(id: string): Promise<Article> {
    return this.articleRepository.findOne({
      where: { id },
      relations: [
        'blog',
        'author',
        'editor',
        'categories',
        'tags',
        'translations',
        'translations.language',
      ],
    });
  }

  async findBySlug(slug: string, languageCode?: string): Promise<Article> {
    const query = this.articleRepository
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.blog', 'blog')
      .leftJoinAndSelect('article.author', 'author')
      .leftJoinAndSelect('article.editor', 'editor')
      .leftJoinAndSelect('article.categories', 'categories')
      .leftJoinAndSelect('article.tags', 'tags')
      .leftJoinAndSelect('article.translations', 'translation')
      .leftJoinAndSelect('translation.language', 'language')
      .where('article.slug = :slug', { slug });

    if (languageCode) {
      query.andWhere('language.code = :languageCode', { languageCode });
    }

    return query.getOne();
  }

  async update(id: string, updateArticleDto: UpdateArticleDto): Promise<Article> {
    const article = await this.findOne(id);
    if (!article) {
      throw new Error('Article not found');
    }

    const {
      blogId,
      authorId,
      editorId,
      categoryIds,
      tagIds,
      translations,
      ...updateData
    } = updateArticleDto;

    // Update related entities if provided
    if (blogId) {
      const blog = await this.blogRepository.findOne({ where: { id: blogId } });
      if (blog) updateData['blog'] = blog;
    }

    if (authorId) {
      const author = await this.userRepository.findOne({ where: { id: authorId } });
      if (author) updateData['author'] = author;
    }

    if (editorId) {
      const editor = await this.userRepository.findOne({ where: { id: editorId } });
      if (editor) updateData['editor'] = editor;
    }

    if (categoryIds) {
      const categories = await this.categoryRepository.find({
        where: { id: In(categoryIds) },
      });
      updateData['categories'] = categories;
    }

    if (tagIds) {
      const tags = await this.tagRepository.find({ where: { id: In(tagIds) } });
      updateData['tags'] = tags;
    }

    // Update article
    await this.articleRepository.update(id, updateData);

    // Update translations if provided
    if (translations && translations.length > 0) {
      // Remove existing translations
      await this.articleTranslationRepository.delete({ article: { id } });

      // Add new translations
      const languageIds = translations.map((t) => t.languageId);
      const languages = await this.languageRepository.find({
        where: { id: In(languageIds) },
      });

      for (const translationDto of translations) {
        const language = languages.find((l) => l.id === translationDto.languageId);
        if (language) {
          const translationSlug = SlugGenerator.generate(translationDto.title);

          // Generate SEO data
          const seoJsonLd = SeoGenerator.generateJsonLd({
            title: translationDto.seoTitle || translationDto.title,
            description: translationDto.seoDescription || 
              SeoGenerator.generateDescription(translationDto.content),
            url: `/${translationSlug}`,
            image: article.featuredImage,
            author: article.author.firstName + ' ' + article.author.lastName,
            datePublished: article.publishedAt,
            dateModified: new Date(),
            type: 'Article',
          });

          const translation = this.articleTranslationRepository.create({
            ...translationDto,
            slug: translationSlug,
            seoJsonLd,
            article,
            language,
          });
          await this.articleTranslationRepository.save(translation);
        }
      }
    }

    return this.findOne(id);
  }

  async updateStatus(id: string, status: ArticleStatus): Promise<Article> {
    const updateData: any = { status };

    if (status === ArticleStatus.PUBLISHED && !updateData.publishedAt) {
      updateData.publishedAt = new Date();
    }

    await this.articleRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.articleRepository.softDelete(id);
  }

  private async getExistingSlugs(excludeId?: string): Promise<string[]> {
    const query = this.articleRepository
      .createQueryBuilder('article')
      .select('article.slug')
      .where('article.deletedAt IS NULL');

    if (excludeId) {
      query.andWhere('article.id != :excludeId', { excludeId });
    }

    const articles = await query.getMany();
    return articles.map((article) => article.slug);
  }
}
