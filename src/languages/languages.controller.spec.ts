import { Test, TestingModule } from '@nestjs/testing';
import { LanguagesController } from './languages.controller';
import { LanguagesService } from './languages.service';

describe('LanguagesController', () => {
  let controller: LanguagesController;
  let service: LanguagesService;

  const mockLanguage = {
    id: '1',
    code: 'es',
    name: 'Español',
    isDefault: true,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockLanguagesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findActive: jest.fn(),
    findOne: jest.fn(),
    findByCode: jest.fn(),
    findDefault: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LanguagesController],
      providers: [
        {
          provide: LanguagesService,
          useValue: mockLanguagesService,
        },
      ],
    }).compile();

    controller = module.get<LanguagesController>(LanguagesController);
    service = module.get<LanguagesService>(LanguagesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new language', async () => {
      const createLanguageDto = {
        code: 'en',
        name: 'English',
        isDefault: false,
        isActive: true,
      };

      const newLanguage = { ...mockLanguage, ...createLanguageDto, id: '2' };
      mockLanguagesService.create.mockResolvedValue(newLanguage);

      const result = await controller.create(createLanguageDto);

      expect(service.create).toHaveBeenCalledWith(createLanguageDto);
      expect(result).toEqual(newLanguage);
    });

    it('should create default language', async () => {
      const createLanguageDto = {
        code: 'es',
        name: 'Español',
        isDefault: true,
        isActive: true,
      };

      mockLanguagesService.create.mockResolvedValue(mockLanguage);

      const result = await controller.create(createLanguageDto);

      expect(service.create).toHaveBeenCalledWith(createLanguageDto);
      expect(result.isDefault).toBe(true);
    });

    it('should handle creation errors', async () => {
      const createLanguageDto = {
        code: 'es',
        name: 'Español',
      };

      mockLanguagesService.create.mockRejectedValue(
        new Error('Language code already exists'),
      );

      await expect(controller.create(createLanguageDto)).rejects.toThrow(
        'Language code already exists',
      );
    });
  });

  describe('findAll', () => {
    it('should return all languages', async () => {
      const mockLanguages = [
        mockLanguage,
        {
          ...mockLanguage,
          id: '2',
          code: 'en',
          name: 'English',
          isDefault: false,
        },
      ];
      mockLanguagesService.findAll.mockResolvedValue(mockLanguages);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockLanguages);
      expect(result).toHaveLength(2);
    });

    it('should return languages sorted by default first', async () => {
      const mockLanguages = [
        mockLanguage, // default language
        {
          ...mockLanguage,
          id: '2',
          code: 'en',
          name: 'English',
          isDefault: false,
        },
      ];
      mockLanguagesService.findAll.mockResolvedValue(mockLanguages);

      const result = await controller.findAll();

      expect(result[0].isDefault).toBe(true);
    });
  });

  describe('findActive', () => {
    it('should return only active languages', async () => {
      const activeLanguages = [mockLanguage];
      mockLanguagesService.findActive.mockResolvedValue(activeLanguages);

      const result = await controller.findActive();

      expect(service.findActive).toHaveBeenCalled();
      expect(result).toEqual(activeLanguages);
      expect(result.every((lang) => lang.isActive)).toBe(true);
    });

    it('should return empty array when no active languages', async () => {
      mockLanguagesService.findActive.mockResolvedValue([]);

      const result = await controller.findActive();

      expect(result).toEqual([]);
    });
  });

  describe('findDefault', () => {
    it('should return the default language', async () => {
      mockLanguagesService.findDefault.mockResolvedValue(mockLanguage);

      const result = await controller.findDefault();

      expect(service.findDefault).toHaveBeenCalled();
      expect(result).toEqual(mockLanguage);
      expect(result.isDefault).toBe(true);
    });

    it('should return null when no default language exists', async () => {
      mockLanguagesService.findDefault.mockResolvedValue(null);

      const result = await controller.findDefault();

      expect(result).toBeNull();
    });
  });

  describe('findOne', () => {
    it('should return a single language', async () => {
      mockLanguagesService.findOne.mockResolvedValue(mockLanguage);

      const result = await controller.findOne('1');

      expect(service.findOne).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockLanguage);
    });

    it('should return null when language not found', async () => {
      mockLanguagesService.findOne.mockResolvedValue(null);

      const result = await controller.findOne('999');

      expect(service.findOne).toHaveBeenCalledWith('999');
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a language', async () => {
      const updateLanguageDto = {
        name: 'Español (España)',
        isActive: false,
      };

      const updatedLanguage = { ...mockLanguage, ...updateLanguageDto };
      mockLanguagesService.update.mockResolvedValue(updatedLanguage);

      const result = await controller.update('1', updateLanguageDto);

      expect(service.update).toHaveBeenCalledWith('1', updateLanguageDto);
      expect(result).toEqual(updatedLanguage);
    });

    it('should handle setting new default language', async () => {
      const updateLanguageDto = {
        isDefault: true,
      };

      const updatedLanguage = { ...mockLanguage, isDefault: true };
      mockLanguagesService.update.mockResolvedValue(updatedLanguage);

      const result = await controller.update('2', updateLanguageDto);

      expect(service.update).toHaveBeenCalledWith('2', updateLanguageDto);
      expect(result.isDefault).toBe(true);
    });

    it('should handle deactivating language', async () => {
      const updateLanguageDto = {
        isActive: false,
      };

      const updatedLanguage = { ...mockLanguage, isActive: false };
      mockLanguagesService.update.mockResolvedValue(updatedLanguage);

      const result = await controller.update('1', updateLanguageDto);

      expect(result.isActive).toBe(false);
    });
  });

  describe('remove', () => {
    it('should soft delete a language', async () => {
      mockLanguagesService.remove.mockResolvedValue(undefined);

      const result = await controller.remove('1');

      expect(service.remove).toHaveBeenCalledWith('1');
      expect(result).toBeUndefined();
    });

    it('should handle removal errors', async () => {
      mockLanguagesService.remove.mockRejectedValue(
        new Error('Cannot delete default language'),
      );

      await expect(controller.remove('1')).rejects.toThrow(
        'Cannot delete default language',
      );
    });
  });

  describe('validation scenarios', () => {
    it('should validate language code format', async () => {
      const createLanguageDto = {
        code: 'invalid-code-too-long',
        name: 'Invalid Language',
      };

      // This would be handled by ValidationPipe in real scenario
      mockLanguagesService.create.mockRejectedValue(
        new Error('Invalid language code format'),
      );

      await expect(controller.create(createLanguageDto)).rejects.toThrow(
        'Invalid language code format',
      );
    });

    it('should prevent duplicate language codes', async () => {
      const createLanguageDto = {
        code: 'es',
        name: 'Spanish',
      };

      mockLanguagesService.create.mockRejectedValue(
        new Error('Language code already exists'),
      );

      await expect(controller.create(createLanguageDto)).rejects.toThrow(
        'Language code already exists',
      );
    });
  });
});
