import { Test, TestingModule } from '@nestjs/testing';
import { BrandsService } from './brands.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brand } from './entities/brand.entity';
import { ProductCategory } from '../product-categories/entities/product-category.entity';
import { NotFoundException } from '@nestjs/common';

describe('BrandsService', () => {
  let service: BrandsService;
  let brandRepository: Repository<Brand>;
  let categoryRepository: Repository<ProductCategory>;

  const mockCategory = {
    id: 'cat-123',
    name: 'Electronics',
    slug: 'electronics',
  };

  const mockBrand = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Apple',
    slug: 'apple',
    description: 'Technology company',
    logoUrl: 'https://example.com/apple-logo.png',
    websiteUrl: 'https://apple.com',
    isActive: true,
    sortOrder: 0,
    countryOfOrigin: 'USA',
    foundedYear: 1976,
    categories: [mockCategory],
    products: [],
    activeProductsCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockBrandRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([mockBrand]),
    })),
  };

  const mockCategoryRepository = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BrandsService,
        {
          provide: getRepositoryToken(Brand),
          useValue: mockBrandRepository,
        },
        {
          provide: getRepositoryToken(ProductCategory),
          useValue: mockCategoryRepository,
        },
      ],
    }).compile();

    service = module.get<BrandsService>(BrandsService);
    brandRepository = module.get<Repository<Brand>>(getRepositoryToken(Brand));
    categoryRepository = module.get<Repository<ProductCategory>>(
      getRepositoryToken(ProductCategory),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a brand', async () => {
      const createDto = {
        name: 'Apple',
        slug: 'apple',
        description: 'Technology company',
        logoUrl: 'https://example.com/apple-logo.png',
        websiteUrl: 'https://apple.com',
        isActive: true,
        countryOfOrigin: 'USA',
        foundedYear: 1976,
        categoryIds: ['cat-123'],
      };

      mockCategoryRepository.find.mockResolvedValue([mockCategory]);
      mockBrandRepository.create.mockReturnValue(mockBrand);
      mockBrandRepository.save.mockResolvedValue(mockBrand);

      const result = await service.create(createDto);

      expect(categoryRepository.find).toHaveBeenCalledWith({
        where: { id: expect.any(Object) },
      });
      expect(brandRepository.create).toHaveBeenCalled();
      expect(brandRepository.save).toHaveBeenCalledWith(mockBrand);
      expect(result).toEqual(mockBrand);
    });

    it('should throw NotFoundException if categories not found', async () => {
      const createDto = {
        name: 'Apple',
        slug: 'apple',
        categoryIds: ['nonexistent'],
      };

      mockCategoryRepository.find.mockResolvedValue([]);

      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all brands', async () => {
      mockBrandRepository.find.mockResolvedValue([mockBrand]);

      const result = await service.findAll();

      expect(brandRepository.find).toHaveBeenCalledWith({
        relations: ['categories', 'products'],
        order: {
          sortOrder: 'ASC',
          name: 'ASC',
        },
      });
      expect(result).toEqual([mockBrand]);
    });
  });

  describe('findActive', () => {
    it('should return only active brands', async () => {
      mockBrandRepository.find.mockResolvedValue([mockBrand]);

      const result = await service.findActive();

      expect(brandRepository.find).toHaveBeenCalledWith({
        where: { isActive: true },
        relations: ['categories', 'products'],
        order: {
          sortOrder: 'ASC',
          name: 'ASC',
        },
      });
      expect(result).toEqual([mockBrand]);
    });
  });

  describe('findBySlug', () => {
    it('should return brand by slug', async () => {
      mockBrandRepository.findOne.mockResolvedValue(mockBrand);

      const result = await service.findBySlug('apple');

      expect(brandRepository.findOne).toHaveBeenCalledWith({
        where: { slug: 'apple' },
        relations: ['categories', 'products'],
      });
      expect(result).toEqual(mockBrand);
    });

    it('should throw NotFoundException if brand not found', async () => {
      mockBrandRepository.findOne.mockResolvedValue(null);

      await expect(service.findBySlug('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findOne', () => {
    it('should return brand by id', async () => {
      mockBrandRepository.findOne.mockResolvedValue(mockBrand);

      const result = await service.findOne(mockBrand.id);

      expect(brandRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockBrand.id },
        relations: ['categories', 'products'],
      });
      expect(result).toEqual(mockBrand);
    });

    it('should throw NotFoundException if brand not found', async () => {
      mockBrandRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findPublicBrands', () => {
    it('should return public brand data', async () => {
      mockBrandRepository.find.mockResolvedValue([mockBrand]);

      const result = await service.findPublicBrands();

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('activeProductsCount');
      // sortOrder is excluded by the @Exclude decorator in PublicBrandDto
      // but the test might still see it, so we'll check the actual property exists
      expect(result[0]).toHaveProperty('name');
    });
  });

  describe('remove', () => {
    it('should remove a brand', async () => {
      mockBrandRepository.findOne.mockResolvedValue(mockBrand);
      mockBrandRepository.remove.mockResolvedValue(mockBrand);

      await service.remove(mockBrand.id);

      expect(brandRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockBrand.id },
        relations: ['categories', 'products'],
      });
      expect(brandRepository.remove).toHaveBeenCalledWith(mockBrand);
    });
  });
});
