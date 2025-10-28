import { Test, TestingModule } from '@nestjs/testing';
import { ArticlesController } from './articles.controller';
<<<<<<< HEAD

describe('ArticlesController', () => {
  let controller: ArticlesController;
=======
import { ArticlesService } from './articles.service';

describe('ArticlesController', () => {
  let controller: ArticlesController;
  let service: ArticlesService;

  const mockUser = {
    id: '1',
    email: 'author@example.com',
    firstName: 'Author',
    lastName: 'User',
  };

  const mockBlog = {
    id: '1',
    title: 'Tech Blog',
    slug: 'tech-blog',
  };

  const mockCategory = {
    id: '1',
    name: 'Technology',
    slug: 'technology',
  };

  const mockTag = {
    id: '1',
    name: 'JavaScript',
    slug: 'javascript',
  };

  const mockArticle = {
    id: '1',
    title: 'Introduction to NestJS',
    slug: 'introduction-to-nestjs',
    excerpt: 'Learn the basics of NestJS framework',
    content: 'NestJS is a powerful Node.js framework...',
    status: 'published',
    isPublished: true,
    publishedAt: new Date(),
    authorId: '1',
    blogId: '1',
    author: mockUser,
    blog: mockBlog,
    categories: [mockCategory],
    tags: [mockTag],
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockArticlesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findPublished: jest.fn(),
    findByBlog: jest.fn(),
    findByAuthor: jest.fn(),
    findByCategory: jest.fn(),
    findByTag: jest.fn(),
    findOne: jest.fn(),
    findBySlug: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    publish: jest.fn(),
    unpublish: jest.fn(),
  };
>>>>>>> 48e1129 (feat(articles): update)

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArticlesController],
<<<<<<< HEAD
    }).compile();

    controller = module.get<ArticlesController>(ArticlesController);
=======
      providers: [
        {
          provide: ArticlesService,
          useValue: mockArticlesService,
        },
      ],
    }).compile();

    controller = module.get<ArticlesController>(ArticlesController);
    service = module.get<ArticlesService>(ArticlesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
>>>>>>> 48e1129 (feat(articles): update)
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
<<<<<<< HEAD
});
=======

  describe('create', () => {
    it('should create a new article', async () => {
      const createArticleDto = {
        title: 'Getting Started with TypeScript',
        excerpt: 'Learn TypeScript fundamentals',
        content: 'TypeScript is a typed superset of JavaScript...',
        authorId: '1',
        blogId: '1',
        categoryIds: ['1'],
        tagIds: ['1'],
      };

      const newArticle = {
        ...mockArticle,
        ...createArticleDto,
        id: '2',
        slug: 'getting-started-with-typescript',
        status: 'draft',
        isPublished: false,
        publishedAt: null,
      };
      mockArticlesService.create.mockResolvedValue(newArticle);

      const result = await controller.create(createArticleDto);

      expect(service.create).toHaveBeenCalledWith(createArticleDto);
      expect(result).toEqual(newArticle);
      expect(result.slug).toBe('getting-started-with-typescript');
      expect(result.isPublished).toBe(false);
    });

    it('should create article with auto-generated slug', async () => {
      const createArticleDto = {
        title: 'Advanced React Patterns & Best Practices!',
        excerpt: 'Deep dive into React patterns',
        content: 'React patterns help us write better code...',
        authorId: '1',
        blogId: '1',
      };

      const newArticle = {
        ...createArticleDto,
        id: '3',
        slug: 'advanced-react-patterns-best-practices',
        status: 'draft',
        isPublished: false,
        categories: [],
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      mockArticlesService.create.mockResolvedValue(newArticle);

      const result = await controller.create(createArticleDto);

      expect(result.slug).toBe('advanced-react-patterns-best-practices');
    });

    it('should handle creation errors', async () => {
      const createArticleDto = {
        title: 'Duplicate Article',
        excerpt: 'This will fail',
        content: 'Content here',
        authorId: '1',
        blogId: '1',
      };

      mockArticlesService.create.mockRejectedValue(
        new Error('Article title already exists'),
      );

      await expect(controller.create(createArticleDto)).rejects.toThrow(
        'Article title already exists',
      );
    });
  });

  describe('findAll', () => {
    it('should return all articles', async () => {
      const mockArticles = [
        mockArticle,
        {
          ...mockArticle,
          id: '2',
          title: 'Second Article',
          slug: 'second-article',
        },
      ];
      mockArticlesService.findAll.mockResolvedValue(mockArticles);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockArticles);
      expect(result).toHaveLength(2);
    });

    it('should return articles with relations', async () => {
      const articlesWithRelations = [
        {
          ...mockArticle,
          author: mockUser,
          blog: mockBlog,
          categories: [mockCategory],
          tags: [mockTag],
        },
      ];
      mockArticlesService.findAll.mockResolvedValue(articlesWithRelations);

      const result = await controller.findAll();

      expect(result[0].author).toBeDefined();
      expect(result[0].blog).toBeDefined();
      expect(result[0].categories).toHaveLength(1);
      expect(result[0].tags).toHaveLength(1);
    });
  });

  describe('findPublished', () => {
    it('should return only published articles', async () => {
      const publishedArticles = [
        {
          ...mockArticle,
          isPublished: true,
          status: 'published',
        },
      ];
      mockArticlesService.findPublished.mockResolvedValue(publishedArticles);

      const result = await controller.findPublished();

      expect(service.findPublished).toHaveBeenCalled();
      expect(result).toEqual(publishedArticles);
      expect(result.every((article) => article.isPublished)).toBe(true);
    });

    it('should return empty array when no published articles', async () => {
      mockArticlesService.findPublished.mockResolvedValue([]);

      const result = await controller.findPublished();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a single article', async () => {
      mockArticlesService.findOne.mockResolvedValue(mockArticle);

      const result = await controller.findOne('1');

      expect(service.findOne).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockArticle);
    });

    it('should return null when article not found', async () => {
      mockArticlesService.findOne.mockResolvedValue(null);

      const result = await controller.findOne('999');

      expect(service.findOne).toHaveBeenCalledWith('999');
      expect(result).toBeNull();
    });

    it('should return article with translations', async () => {
      const articleWithTranslations = {
        ...mockArticle,
        translations: [
          {
            id: '1',
            languageCode: 'es',
            title: 'Introducción a NestJS',
            excerpt: 'Aprende los fundamentos de NestJS',
            content: 'NestJS es un framework poderoso...',
          },
        ],
      };
      mockArticlesService.findOne.mockResolvedValue(articleWithTranslations);

      const result = await controller.findOne('1');

      expect(result.translations).toBeDefined();
      expect(result.translations).toHaveLength(1);
    });
  });

  describe('update', () => {
    it('should update an article', async () => {
      const updateArticleDto = {
        title: 'Updated Article Title',
        excerpt: 'Updated excerpt',
        content: 'Updated content...',
      };

      const updatedArticle = {
        ...mockArticle,
        ...updateArticleDto,
        slug: 'updated-article-title',
      };
      mockArticlesService.update.mockResolvedValue(updatedArticle);

      const result = await controller.update('1', updateArticleDto);

      expect(service.update).toHaveBeenCalledWith('1', updateArticleDto);
      expect(result).toEqual(updatedArticle);
    });

    it('should update slug when title changes', async () => {
      const updateArticleDto = {
        title: 'Completely New Article Title',
      };

      const updatedArticle = {
        ...mockArticle,
        title: 'Completely New Article Title',
        slug: 'completely-new-article-title',
      };
      mockArticlesService.update.mockResolvedValue(updatedArticle);

      const result = await controller.update('1', updateArticleDto);

      expect(result.slug).toBe('completely-new-article-title');
    });

    it('should update categories and tags', async () => {
      const updateArticleDto = {
        categoryIds: ['2', '3'],
        tagIds: ['2', '3', '4'],
      };

      const updatedArticle = {
        ...mockArticle,
        categories: [
          { ...mockCategory, id: '2', name: 'Programming' },
          { ...mockCategory, id: '3', name: 'Web Development' },
        ],
        tags: [
          { ...mockTag, id: '2', name: 'TypeScript' },
          { ...mockTag, id: '3', name: 'Node.js' },
          { ...mockTag, id: '4', name: 'Backend' },
        ],
      };
      mockArticlesService.update.mockResolvedValue(updatedArticle);

      const result = await controller.update('1', updateArticleDto);

      expect(result.categories).toHaveLength(2);
      expect(result.tags).toHaveLength(3);
    });
  });

  describe('remove', () => {
    it('should soft delete an article', async () => {
      mockArticlesService.remove.mockResolvedValue(undefined);

      const result = await controller.remove('1');

      expect(service.remove).toHaveBeenCalledWith('1');
      expect(result).toBeUndefined();
    });

    it('should handle removal errors', async () => {
      mockArticlesService.remove.mockRejectedValue(
        new Error('Cannot delete published article'),
      );

      await expect(controller.remove('1')).rejects.toThrow(
        'Cannot delete published article',
      );
    });

    it('should handle article not found for removal', async () => {
      mockArticlesService.remove.mockRejectedValue(
        new Error('Article not found'),
      );

      await expect(controller.remove('999')).rejects.toThrow(
        'Article not found',
      );
    });
  });

  describe('validation scenarios', () => {
    it('should validate title length', async () => {
      const createArticleDto = {
        title: 'A', // Too short
        excerpt: 'Valid excerpt',
        content: 'Valid content',
        authorId: '1',
        blogId: '1',
      };

      mockArticlesService.create.mockRejectedValue(
        new Error('Title too short'),
      );

      await expect(controller.create(createArticleDto)).rejects.toThrow(
        'Title too short',
      );
    });

    it('should prevent duplicate titles within same blog', async () => {
      const createArticleDto = {
        title: 'Introduction to NestJS', // Same as mockArticle
        excerpt: 'Different excerpt',
        content: 'Different content',
        authorId: '1',
        blogId: '1',
      };

      mockArticlesService.create.mockRejectedValue(
        new Error('Article title already exists in this blog'),
      );

      await expect(controller.create(createArticleDto)).rejects.toThrow(
        'Article title already exists in this blog',
      );
    });

    it('should validate author and blog exist', async () => {
      const createArticleDto = {
        title: 'Valid Article',
        excerpt: 'Valid excerpt',
        content: 'Valid content',
        authorId: '999', // Non-existent author
        blogId: '999', // Non-existent blog
      };

      mockArticlesService.create.mockRejectedValue(
        new Error('Author or blog not found'),
      );

      await expect(controller.create(createArticleDto)).rejects.toThrow(
        'Author or blog not found',
      );
    });

    it('should validate content length', async () => {
      const createArticleDto = {
        title: 'Valid Title',
        excerpt: 'Valid excerpt',
        content: 'Too short', // Content too short
        authorId: '1',
        blogId: '1',
      };

      mockArticlesService.create.mockRejectedValue(
        new Error('Content too short'),
      );

      await expect(controller.create(createArticleDto)).rejects.toThrow(
        'Content too short',
      );
    });
  });

  describe('status management', () => {
    it('should handle draft status', async () => {
      const draftArticle = {
        ...mockArticle,
        status: 'draft',
        isPublished: false,
        publishedAt: null,
      };

      mockArticlesService.findOne.mockResolvedValue(draftArticle);

      const result = await controller.findOne('1');

      expect(result.status).toBe('draft');
      expect(result.isPublished).toBe(false);
      expect(result.publishedAt).toBeNull();
    });

    it('should handle published status', async () => {
      const publishedArticle = {
        ...mockArticle,
        status: 'published',
        isPublished: true,
        publishedAt: new Date(),
      };

      mockArticlesService.findOne.mockResolvedValue(publishedArticle);

      const result = await controller.findOne('1');

      expect(result.status).toBe('published');
      expect(result.isPublished).toBe(true);
      expect(result.publishedAt).toBeDefined();
    });
  });
});
>>>>>>> 48e1129 (feat(articles): update)
