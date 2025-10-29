import { Test, TestingModule } from '@nestjs/testing';
import { ProductCategoriesService } from './product-categories.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductCategory } from './entities/product-category.entity';
import { NotFoundException } from '@nestjs/common';

describe('ProductCategoriesService', () => {
  let service: ProductCategoriesService;
  let repository: Repository<ProductCategory>;

  const mockCategory = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Electronics',
    slug: 'electronics',
    description: 'Electronic products and devices',
    imageUrl: 'https://example.com/electronics.jpg',
    isActive: true,
    sortOrder: 0,
    products: [],
    brands: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductCategoriesService,
        {
          provide: getRepositoryToken(ProductCategory),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ProductCategoriesService>(ProductCategoriesService);
    repository = module.get<Repository<ProductCategory>>(
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
    it('should create a product category', async () => {
      const createDto = {
        name: 'Electronics',
        slug: 'electronics',
        description: 'Electronic products',
      };

      mockRepository.create.mockReturnValue(mockCategory);
      mockRepository.save.mockResolvedValue(mockCategory);

      const result = await service.create(createDto);

      expect(repository.create).toHaveBeenCalledWith({
        ...createDto,
        isActive: true,
        sortOrder: 0,
      });
      expect(repository.save).toHaveBeenCalledWith(mockCategory);
      expect(result).toEqual(mockCategory);
    });
  });

  describe('findAll', () => {
    it('should return all categories', async () => {
      mockRepository.find.mockResolvedValue([mockCategory]);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalledWith({
        relations: ['products'],
        order: {
          sortOrder: 'ASC',
          name: 'ASC',
        },
      });
      expect(result).toEqual([mockCategory]);
    });
  });

  describe('findActive', () => {
    it('should return only active categories', async () => {
      mockRepository.find.mockResolvedValue([mockCategory]);

      const result = await service.findActive();

      expect(repository.find).toHaveBeenCalledWith({
        where: { isActive: true },
        relations: ['products'],
        order: {
          sortOrder: 'ASC',
          name: 'ASC',
        },
      });
      expect(result).toEqual([mockCategory]);
    });
  });

  describe('findBySlug', () => {
    it('should return category by slug', async () => {
      mockRepository.findOne.mockResolvedValue(mockCategory);

      const result = await service.findBySlug('electronics');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { slug: 'electronics' },
        relations: ['products'],
      });
      expect(result).toEqual(mockCategory);
    });

    it('should throw NotFoundException if category not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findBySlug('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findOne', () => {
    it('should return category by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockCategory);

      const result = await service.findOne(mockCategory.id);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: mockCategory.id },
        relations: ['products'],
      });
      expect(result).toEqual(mockCategory);
    });

    it('should throw NotFoundException if category not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a category', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockCategory);
      mockRepository.remove.mockResolvedValue(mockCategory);

      await service.remove(mockCategory.id);

      expect(service.findOne).toHaveBeenCalledWith(mockCategory.id);
      expect(repository.remove).toHaveBeenCalledWith(mockCategory);
    });
  });
});
