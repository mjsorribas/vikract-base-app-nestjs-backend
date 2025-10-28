import { Test, TestingModule } from '@nestjs/testing';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';

describe('ArticlesController', () => {
  let controller: ArticlesController;
  let service: ArticlesService;

  const mockArticlesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArticlesController],
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
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new article', async () => {
      const newArticle = {
        id: '1',
        title: 'Test Article',
        slug: 'test-article',
        excerpt: 'Test excerpt',
        content: 'Test content',
        status: 'draft',
        isPublished: false,
      };
      mockArticlesService.create.mockResolvedValue(newArticle);

      const createArticleDto = {
        title: 'Test Article',
        excerpt: 'Test excerpt',
        content: 'Test content',
        authorId: '1',
        blogId: '1',
        translations: [],
      };

      const result = await controller.create(createArticleDto);

      expect(service.create).toHaveBeenCalledWith(createArticleDto);
      expect(result).toEqual(newArticle);
    });
  });

  describe('findAll', () => {
    it('should return all articles', async () => {
      const mockArticles = [
        {
          id: '1',
          title: 'Article 1',
          slug: 'article-1',
        },
      ];
      mockArticlesService.findAll.mockResolvedValue(mockArticles);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockArticles);
    });
  });

  describe('findOne', () => {
    it('should return a single article', async () => {
      const mockArticle = {
        id: '1',
        title: 'Test Article',
        slug: 'test-article',
      };
      mockArticlesService.findOne.mockResolvedValue(mockArticle);

      const result = await controller.findOne('1');

      expect(service.findOne).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockArticle);
    });
  });

  describe('update', () => {
    it('should update an article', async () => {
      const updatedArticle = {
        id: '1',
        title: 'Updated Article',
        slug: 'updated-article',
      };
      mockArticlesService.update.mockResolvedValue(updatedArticle);

      const updateArticleDto = {
        translations: [],
      };

      const result = await controller.update('1', updateArticleDto);

      expect(service.update).toHaveBeenCalledWith('1', updateArticleDto);
      expect(result).toEqual(updatedArticle);
    });
  });

  describe('remove', () => {
    it('should remove an article', async () => {
      mockArticlesService.remove.mockResolvedValue(undefined);

      const result = await controller.remove('1');

      expect(service.remove).toHaveBeenCalledWith('1');
      expect(result).toBeUndefined();
    });
  });
});
