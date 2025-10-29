import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let service: CategoriesService;

  const mockCategory = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    slug: 'technology',
    featuredImage: 'tech.jpg',
    isActive: true,
    translations: [
      {
        id: '123e4567-e89b-12d3-a456-426614174001',
        name: 'Technology',
        description: 'Tech articles',
        slug: 'technology',
        seoTitle: 'Technology Articles',
        seoDescription: 'Articles about technology',
        seoKeywords: 'tech, technology, programming',
        language: { id: '1', code: 'en', name: 'English' },
      },
      {
        id: '123e4567-e89b-12d3-a456-426614174002',
        name: 'Tecnología',
        description: 'Artículos de tecnología',
        slug: 'tecnologia',
        seoTitle: 'Artículos de Tecnología',
        seoDescription: 'Artículos sobre tecnología',
        seoKeywords: 'tech, tecnología, programación',
        language: { id: '2', code: 'es', name: 'Spanish' },
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCategoriesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findActive: jest.fn(),
    findBySlug: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: mockCategoriesService,
        },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
    service = module.get<CategoriesService>(CategoriesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a category with multiple translations', async () => {
      const createDto: CreateCategoryDto = {
        featuredImage: 'tech.jpg',
        translations: [
          {
            name: 'Technology',
            description: 'Tech articles',
            seoTitle: 'Technology Articles',
            seoDescription: 'Articles about technology',
            seoKeywords: 'tech, technology, programming',
            languageId: '1',
          },
          {
            name: 'Tecnología',
            description: 'Artículos de tecnología',
            seoTitle: 'Artículos de Tecnología',
            seoDescription: 'Artículos sobre tecnología',
            seoKeywords: 'tech, tecnología, programación',
            languageId: '2',
          },
        ],
      };

      mockCategoriesService.create.mockResolvedValue(mockCategory);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockCategory);
      expect(result.translations).toHaveLength(2);
      expect(result.translations[0].language.code).toBe('en');
      expect(result.translations[1].language.code).toBe('es');
    });
  });

  describe('findAll', () => {
    it('should return all categories without language filter', async () => {
      mockCategoriesService.findAll.mockResolvedValue([mockCategory]);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledWith(undefined);
      expect(result).toEqual([mockCategory]);
    });

    it('should return categories filtered by English language', async () => {
      const englishCategory = {
        ...mockCategory,
        translations: [mockCategory.translations[0]], // Solo traducción en inglés
      };

      mockCategoriesService.findAll.mockResolvedValue([englishCategory]);

      const result = await controller.findAll('en');

      expect(service.findAll).toHaveBeenCalledWith('en');
      expect(result).toEqual([englishCategory]);
      expect(result[0].translations).toHaveLength(1);
      expect(result[0].translations[0].language.code).toBe('en');
    });

    it('should return categories filtered by Spanish language', async () => {
      const spanishCategory = {
        ...mockCategory,
        translations: [mockCategory.translations[1]], // Solo traducción en español
      };

      mockCategoriesService.findAll.mockResolvedValue([spanishCategory]);

      const result = await controller.findAll('es');

      expect(service.findAll).toHaveBeenCalledWith('es');
      expect(result).toEqual([spanishCategory]);
      expect(result[0].translations).toHaveLength(1);
      expect(result[0].translations[0].language.code).toBe('es');
    });
  });

  describe('findActive', () => {
    it('should return active categories filtered by English language', async () => {
      const englishCategory = {
        ...mockCategory,
        translations: [mockCategory.translations[0]],
      };

      mockCategoriesService.findActive.mockResolvedValue([englishCategory]);

      const result = await controller.findActive('en');

      expect(service.findActive).toHaveBeenCalledWith('en');
      expect(result).toEqual([englishCategory]);
      expect(result[0].isActive).toBe(true);
      expect(result[0].translations[0].language.code).toBe('en');
    });

    it('should return active categories filtered by Spanish language', async () => {
      const spanishCategory = {
        ...mockCategory,
        translations: [mockCategory.translations[1]],
      };

      mockCategoriesService.findActive.mockResolvedValue([spanishCategory]);

      const result = await controller.findActive('es');

      expect(service.findActive).toHaveBeenCalledWith('es');
      expect(result).toEqual([spanishCategory]);
      expect(result[0].isActive).toBe(true);
      expect(result[0].translations[0].language.code).toBe('es');
    });
  });

  describe('findBySlug', () => {
    it('should find category by slug in English', async () => {
      const englishCategory = {
        ...mockCategory,
        translations: [mockCategory.translations[0]],
      };

      mockCategoriesService.findBySlug.mockResolvedValue(englishCategory);

      const result = await controller.findBySlug('technology', 'en');

      expect(service.findBySlug).toHaveBeenCalledWith('technology', 'en');
      expect(result).toEqual(englishCategory);
      expect(result.translations[0].name).toBe('Technology');
    });

    it('should find category by slug in Spanish', async () => {
      const spanishCategory = {
        ...mockCategory,
        slug: 'tecnologia',
        translations: [mockCategory.translations[1]],
      };

      mockCategoriesService.findBySlug.mockResolvedValue(spanishCategory);

      const result = await controller.findBySlug('tecnologia', 'es');

      expect(service.findBySlug).toHaveBeenCalledWith('tecnologia', 'es');
      expect(result).toEqual(spanishCategory);
      expect(result.translations[0].name).toBe('Tecnología');
    });

    it('should find category by slug without language filter', async () => {
      mockCategoriesService.findBySlug.mockResolvedValue(mockCategory);

      const result = await controller.findBySlug('technology');

      expect(service.findBySlug).toHaveBeenCalledWith('technology', undefined);
      expect(result).toEqual(mockCategory);
      expect(result.translations).toHaveLength(2);
    });
  });

  describe('findOne', () => {
    it('should find category by id with all translations', async () => {
      mockCategoriesService.findOne.mockResolvedValue(mockCategory);

      const result = await controller.findOne(mockCategory.id);

      expect(service.findOne).toHaveBeenCalledWith(mockCategory.id);
      expect(result).toEqual(mockCategory);
      expect(result.translations).toHaveLength(2);
    });
  });

  describe('update', () => {
    it('should update category with new translations', async () => {
      const updateDto: UpdateCategoryDto = {
        featuredImage: 'new-tech.jpg',
        translations: [
          {
            name: 'Updated Technology',
            description: 'Updated tech articles',
            languageId: '1',
          },
          {
            name: 'Tecnología Actualizada',
            description: 'Artículos de tecnología actualizados',
            languageId: '2',
          },
        ],
      };

      const updatedCategory = {
        ...mockCategory,
        featuredImage: 'new-tech.jpg',
        translations: [
          {
            ...mockCategory.translations[0],
            name: 'Updated Technology',
            description: 'Updated tech articles',
          },
          {
            ...mockCategory.translations[1],
            name: 'Tecnología Actualizada',
            description: 'Artículos de tecnología actualizados',
          },
        ],
      };

      mockCategoriesService.update.mockResolvedValue(updatedCategory);

      const result = await controller.update(mockCategory.id, updateDto);

      expect(service.update).toHaveBeenCalledWith(mockCategory.id, updateDto);
      expect(result).toEqual(updatedCategory);
      expect(result.translations[0].name).toBe('Updated Technology');
      expect(result.translations[1].name).toBe('Tecnología Actualizada');
    });
  });

  describe('remove', () => {
    it('should remove category by id', async () => {
      mockCategoriesService.remove.mockResolvedValue(undefined);

      await controller.remove(mockCategory.id);

      expect(service.remove).toHaveBeenCalledWith(mockCategory.id);
    });
  });
});
