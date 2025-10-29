import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductMedia } from './entities/product-media.entity';
import { ProductCategory } from '../product-categories/entities/product-category.entity';
import { Brand } from '../brands/entities/brand.entity';
import { NotFoundException } from '@nestjs/common';

describe('ProductsService', () => {
  let service: ProductsService;
  let productRepository: Repository<Product>;
  let categoryRepository: Repository<ProductCategory>;

  const mockCategory = {
    id: 'cat-123',
    name: 'Electronics',
    slug: 'electronics',
  };

  const mockProduct = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Product',
    productCode: 'TEST-001',
    shortDescription: 'A test product',
    longDescription: 'This is a detailed description of the test product',
    salePrice: 29.99,
    offerPrice: 19.99,
    isOfferActive: true,
    availableStock: 100,
    weight: 0.5,
    size: 'Medium',
    slug: 'test-product',
    stockLimit: 10,
    hasShipping: true,
    hasPickup: true,
    purchasePrice: 15,
    isActive: true,
    isInStock: true,
    currentPrice: 19.99,
    isOnSale: true,
    category: mockCategory,
    categoryId: 'cat-123',
    mainImage: null,
    mainVideo: null,
    media: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockProductRepository = {
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
      getMany: jest.fn().mockResolvedValue([mockProduct]),
    })),
  };

  const mockMediaRepository = {
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  const mockCategoryRepository = {
    findOne: jest.fn(),
  };

  const mockBrandRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository,
        },
        {
          provide: getRepositoryToken(ProductMedia),
          useValue: mockMediaRepository,
        },
        {
          provide: getRepositoryToken(ProductCategory),
          useValue: mockCategoryRepository,
        },
        {
          provide: getRepositoryToken(Brand),
          useValue: mockBrandRepository,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    productRepository = module.get<Repository<Product>>(
      getRepositoryToken(Product),
    );
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
    it('should create a product', async () => {
      const createDto = {
        name: 'Test Product',
        productCode: 'TEST-001',
        shortDescription: 'A test product',
        longDescription: 'This is a detailed description',
        salePrice: 29.99,
        availableStock: 100,
        weight: 0.5,
        size: 'Medium',
        slug: 'test-product',
        stockLimit: 10,
        hasShipping: true,
        hasPickup: true,
        purchasePrice: 15,
        categoryId: 'cat-123',
      };

      mockCategoryRepository.findOne.mockResolvedValue(mockCategory);
      mockProductRepository.create.mockReturnValue(mockProduct);
      mockProductRepository.save.mockResolvedValue(mockProduct);
      mockProductRepository.findOne.mockResolvedValue(mockProduct);

      const result = await service.create(createDto);

      expect(categoryRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'cat-123' },
      });
      expect(productRepository.create).toHaveBeenCalled();
      expect(productRepository.save).toHaveBeenCalledWith(mockProduct);
      expect(result).toEqual(mockProduct);
    });

    it('should throw NotFoundException if category not found', async () => {
      const createDto = {
        name: 'Test Product',
        productCode: 'TEST-001',
        shortDescription: 'A test product',
        longDescription: 'This is a detailed description',
        salePrice: 29.99,
        availableStock: 100,
        weight: 0.5,
        size: 'Medium',
        slug: 'test-product',
        stockLimit: 10,
        hasShipping: true,
        hasPickup: true,
        purchasePrice: 15,
        categoryId: 'nonexistent',
      };

      mockCategoryRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all products', async () => {
      mockProductRepository.find.mockResolvedValue([mockProduct]);

      const result = await service.findAll();

      expect(productRepository.find).toHaveBeenCalledWith({
        relations: ['category', 'brand', 'media'],
        order: {
          createdAt: 'DESC',
          media: {
            sortOrder: 'ASC',
          },
        },
      });
      expect(result).toEqual([mockProduct]);
    });
  });

  describe('findActive', () => {
    it('should return only active products', async () => {
      mockProductRepository.find.mockResolvedValue([mockProduct]);

      const result = await service.findActive();

      expect(productRepository.find).toHaveBeenCalledWith({
        where: { isActive: true },
        relations: ['category', 'brand', 'media'],
        order: {
          createdAt: 'DESC',
          media: {
            sortOrder: 'ASC',
          },
        },
      });
      expect(result).toEqual([mockProduct]);
    });
  });

  describe('findOne', () => {
    it('should return product by id', async () => {
      mockProductRepository.findOne.mockResolvedValue(mockProduct);

      const result = await service.findOne(mockProduct.id);

      expect(productRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockProduct.id },
        relations: ['category', 'brand', 'media'],
        order: {
          media: {
            sortOrder: 'ASC',
          },
        },
      });
      expect(result).toEqual(mockProduct);
    });

    it('should throw NotFoundException if product not found', async () => {
      mockProductRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findBySlug', () => {
    it('should return product by slug', async () => {
      mockProductRepository.findOne.mockResolvedValue(mockProduct);

      const result = await service.findBySlug('test-product');

      expect(productRepository.findOne).toHaveBeenCalledWith({
        where: { slug: 'test-product' },
        relations: ['category', 'brand', 'media'],
        order: {
          media: {
            sortOrder: 'ASC',
          },
        },
      });
      expect(result).toEqual(mockProduct);
    });

    it('should throw NotFoundException if product not found', async () => {
      mockProductRepository.findOne.mockResolvedValue(null);

      await expect(service.findBySlug('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findPublicProducts', () => {
    it('should return public product data without sensitive fields', async () => {
      mockProductRepository.find.mockResolvedValue([mockProduct]);

      const result = await service.findPublicProducts();

      expect(result).toHaveLength(1);
      expect(result[0]).not.toHaveProperty('purchasePrice');
      expect(result[0]).not.toHaveProperty('stockLimit');
      expect(result[0]).toHaveProperty('isInStock');
      expect(result[0]).toHaveProperty('currentPrice');
      expect(result[0]).toHaveProperty('isOnSale');
    });
  });

  describe('remove', () => {
    it('should remove a product', async () => {
      mockProductRepository.findOne.mockResolvedValue(mockProduct);
      mockProductRepository.remove.mockResolvedValue(mockProduct);

      await service.remove(mockProduct.id);

      expect(productRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockProduct.id },
        relations: ['category', 'brand', 'media'],
        order: {
          media: {
            sortOrder: 'ASC',
          },
        },
      });
      expect(productRepository.remove).toHaveBeenCalledWith(mockProduct);
    });
  });
});
