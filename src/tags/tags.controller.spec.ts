import { Test, TestingModule } from '@nestjs/testing';
import { TagsController } from './tags.controller';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

describe('TagsController', () => {
  let controller: TagsController;
  let service: TagsService;

  const mockTag = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    slug: 'javascript',
    isActive: true,
    translations: [
      {
        id: '123e4567-e89b-12d3-a456-426614174001',
        name: 'JavaScript',
        description: 'JavaScript programming language and frameworks',
        slug: 'javascript',
        language: { id: '1', code: 'en', name: 'English' },
      },
      {
        id: '123e4567-e89b-12d3-a456-426614174002',
        name: 'JavaScript',
        description: 'Lenguaje de programación JavaScript y frameworks',
        slug: 'javascript',
        language: { id: '2', code: 'es', name: 'Spanish' },
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTagsService = {
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
      controllers: [TagsController],
      providers: [
        {
          provide: TagsService,
          useValue: mockTagsService,
        },
      ],
    }).compile();

    controller = module.get<TagsController>(TagsController);
    service = module.get<TagsService>(TagsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a tag with multiple translations', async () => {
      const createDto: CreateTagDto = {
        translations: [
          {
            name: 'JavaScript',
            description: 'JavaScript programming language and frameworks',
            languageId: '1',
          },
          {
            name: 'JavaScript',
            description: 'Lenguaje de programación JavaScript y frameworks',
            languageId: '2',
          },
        ],
      };

      mockTagsService.create.mockResolvedValue(mockTag);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockTag);
      expect(result.translations).toHaveLength(2);
      expect(result.translations[0].language.code).toBe('en');
      expect(result.translations[1].language.code).toBe('es');
    });

    it('should create a tag with different names per language', async () => {
      const createDto: CreateTagDto = {
        translations: [
          {
            name: 'Web Development',
            description: 'Web development tools and technologies',
            languageId: '1',
          },
          {
            name: 'Desarrollo Web',
            description: 'Herramientas y tecnologías de desarrollo web',
            languageId: '2',
          },
        ],
      };

      const mockWebDevTag = {
        ...mockTag,
        slug: 'web-development',
        translations: [
          {
            id: '123e4567-e89b-12d3-a456-426614174003',
            name: 'Web Development',
            description: 'Web development tools and technologies',
            slug: 'web-development',
            language: { id: '1', code: 'en', name: 'English' },
          },
          {
            id: '123e4567-e89b-12d3-a456-426614174004',
            name: 'Desarrollo Web',
            description: 'Herramientas y tecnologías de desarrollo web',
            slug: 'desarrollo-web',
            language: { id: '2', code: 'es', name: 'Spanish' },
          },
        ],
      };

      mockTagsService.create.mockResolvedValue(mockWebDevTag);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockWebDevTag);
      expect(result.translations[0].name).toBe('Web Development');
      expect(result.translations[1].name).toBe('Desarrollo Web');
    });
  });

  describe('findAll', () => {
    it('should return all tags without language filter', async () => {
      mockTagsService.findAll.mockResolvedValue([mockTag]);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledWith(undefined);
      expect(result).toEqual([mockTag]);
    });

    it('should return tags filtered by English language', async () => {
      const englishTag = {
        ...mockTag,
        translations: [mockTag.translations[0]], // Solo traducción en inglés
      };

      mockTagsService.findAll.mockResolvedValue([englishTag]);

      const result = await controller.findAll('en');

      expect(service.findAll).toHaveBeenCalledWith('en');
      expect(result).toEqual([englishTag]);
      expect(result[0].translations).toHaveLength(1);
      expect(result[0].translations[0].language.code).toBe('en');
      expect(result[0].translations[0].description).toBe(
        'JavaScript programming language and frameworks',
      );
    });

    it('should return tags filtered by Spanish language', async () => {
      const spanishTag = {
        ...mockTag,
        translations: [mockTag.translations[1]], // Solo traducción en español
      };

      mockTagsService.findAll.mockResolvedValue([spanishTag]);

      const result = await controller.findAll('es');

      expect(service.findAll).toHaveBeenCalledWith('es');
      expect(result).toEqual([spanishTag]);
      expect(result[0].translations).toHaveLength(1);
      expect(result[0].translations[0].language.code).toBe('es');
      expect(result[0].translations[0].description).toBe(
        'Lenguaje de programación JavaScript y frameworks',
      );
    });
  });

  describe('findActive', () => {
    it('should return active tags filtered by English language', async () => {
      const englishTag = {
        ...mockTag,
        translations: [mockTag.translations[0]],
      };

      mockTagsService.findActive.mockResolvedValue([englishTag]);

      const result = await controller.findActive('en');

      expect(service.findActive).toHaveBeenCalledWith('en');
      expect(result).toEqual([englishTag]);
      expect(result[0].isActive).toBe(true);
      expect(result[0].translations[0].language.code).toBe('en');
    });

    it('should return active tags filtered by Spanish language', async () => {
      const spanishTag = {
        ...mockTag,
        translations: [mockTag.translations[1]],
      };

      mockTagsService.findActive.mockResolvedValue([spanishTag]);

      const result = await controller.findActive('es');

      expect(service.findActive).toHaveBeenCalledWith('es');
      expect(result).toEqual([spanishTag]);
      expect(result[0].isActive).toBe(true);
      expect(result[0].translations[0].language.code).toBe('es');
    });

    it('should return active tags without language filter', async () => {
      mockTagsService.findActive.mockResolvedValue([mockTag]);

      const result = await controller.findActive();

      expect(service.findActive).toHaveBeenCalledWith(undefined);
      expect(result).toEqual([mockTag]);
      expect(result[0].isActive).toBe(true);
      expect(result[0].translations).toHaveLength(2);
    });
  });

  describe('findBySlug', () => {
    it('should find tag by slug in English', async () => {
      const englishTag = {
        ...mockTag,
        translations: [mockTag.translations[0]],
      };

      mockTagsService.findBySlug.mockResolvedValue(englishTag);

      const result = await controller.findBySlug('javascript', 'en');

      expect(service.findBySlug).toHaveBeenCalledWith('javascript', 'en');
      expect(result).toEqual(englishTag);
      expect(result.translations[0].name).toBe('JavaScript');
      expect(result.translations[0].description).toBe(
        'JavaScript programming language and frameworks',
      );
    });

    it('should find tag by slug in Spanish', async () => {
      const spanishTag = {
        ...mockTag,
        translations: [mockTag.translations[1]],
      };

      mockTagsService.findBySlug.mockResolvedValue(spanishTag);

      const result = await controller.findBySlug('javascript', 'es');

      expect(service.findBySlug).toHaveBeenCalledWith('javascript', 'es');
      expect(result).toEqual(spanishTag);
      expect(result.translations[0].name).toBe('JavaScript');
      expect(result.translations[0].description).toBe(
        'Lenguaje de programación JavaScript y frameworks',
      );
    });

    it('should find tag by slug without language filter', async () => {
      mockTagsService.findBySlug.mockResolvedValue(mockTag);

      const result = await controller.findBySlug('javascript');

      expect(service.findBySlug).toHaveBeenCalledWith('javascript', undefined);
      expect(result).toEqual(mockTag);
      expect(result.translations).toHaveLength(2);
    });
  });

  describe('findOne', () => {
    it('should find tag by id with all translations', async () => {
      mockTagsService.findOne.mockResolvedValue(mockTag);

      const result = await controller.findOne(mockTag.id);

      expect(service.findOne).toHaveBeenCalledWith(mockTag.id);
      expect(result).toEqual(mockTag);
      expect(result.translations).toHaveLength(2);
    });
  });

  describe('update', () => {
    it('should update tag with new translations', async () => {
      const updateDto: UpdateTagDto = {
        translations: [
          {
            name: 'JavaScript & TypeScript',
            description: 'JavaScript and TypeScript programming languages',
            languageId: '1',
          },
          {
            name: 'JavaScript y TypeScript',
            description: 'Lenguajes de programación JavaScript y TypeScript',
            languageId: '2',
          },
        ],
      };

      const updatedTag = {
        ...mockTag,
        translations: [
          {
            ...mockTag.translations[0],
            name: 'JavaScript & TypeScript',
            description: 'JavaScript and TypeScript programming languages',
          },
          {
            ...mockTag.translations[1],
            name: 'JavaScript y TypeScript',
            description: 'Lenguajes de programación JavaScript y TypeScript',
          },
        ],
      };

      mockTagsService.update.mockResolvedValue(updatedTag);

      const result = await controller.update(mockTag.id, updateDto);

      expect(service.update).toHaveBeenCalledWith(mockTag.id, updateDto);
      expect(result).toEqual(updatedTag);
      expect(result.translations[0].name).toBe('JavaScript & TypeScript');
      expect(result.translations[1].name).toBe('JavaScript y TypeScript');
    });

    it('should update tag status', async () => {
      const updateDto: UpdateTagDto = {
        isActive: false,
      };

      const updatedTag = {
        ...mockTag,
        isActive: false,
      };

      mockTagsService.update.mockResolvedValue(updatedTag);

      const result = await controller.update(mockTag.id, updateDto);

      expect(service.update).toHaveBeenCalledWith(mockTag.id, updateDto);
      expect(result).toEqual(updatedTag);
      expect(result.isActive).toBe(false);
    });
  });

  describe('remove', () => {
    it('should remove tag by id', async () => {
      mockTagsService.remove.mockResolvedValue(undefined);

      await controller.remove(mockTag.id);

      expect(service.remove).toHaveBeenCalledWith(mockTag.id);
    });
  });
});
