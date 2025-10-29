import { Test, TestingModule } from '@nestjs/testing';
import { CarouselsController } from './carousels.controller';
import { CarouselsService } from './carousels.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('CarouselsController', () => {
  let controller: CarouselsController;
  let service: CarouselsService;

  const mockCarousel = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Carousel',
    description: 'Test carousel description',
    isActive: true,
    autoplayDelay: 5000,
    showIndicators: true,
    showNavigation: true,
    slides: [],
    article: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCarouselsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findActive: jest.fn(),
    findByArticle: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    reorderSlides: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CarouselsController],
      providers: [
        {
          provide: CarouselsService,
          useValue: mockCarouselsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<CarouselsController>(CarouselsController);
    service = module.get<CarouselsService>(CarouselsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a carousel', async () => {
      const createDto = {
        name: 'Test Carousel',
        description: 'Test description',
      };

      mockCarouselsService.create.mockResolvedValue(mockCarousel);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockCarousel);
    });
  });

  describe('findAll', () => {
    it('should return all carousels when no filter is applied', async () => {
      mockCarouselsService.findAll.mockResolvedValue([mockCarousel]);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockCarousel]);
    });

    it('should return only active carousels when active=true', async () => {
      mockCarouselsService.findActive.mockResolvedValue([mockCarousel]);

      const result = await controller.findAll('true');

      expect(service.findActive).toHaveBeenCalled();
      expect(result).toEqual([mockCarousel]);
    });
  });

  describe('findByArticle', () => {
    it('should return carousels for a specific article', async () => {
      const articleId = 'article-id';
      mockCarouselsService.findByArticle.mockResolvedValue([mockCarousel]);

      const result = await controller.findByArticle(articleId);

      expect(service.findByArticle).toHaveBeenCalledWith(articleId);
      expect(result).toEqual([mockCarousel]);
    });
  });

  describe('findOne', () => {
    it('should return a carousel by id', async () => {
      mockCarouselsService.findOne.mockResolvedValue(mockCarousel);

      const result = await controller.findOne(mockCarousel.id);

      expect(service.findOne).toHaveBeenCalledWith(mockCarousel.id);
      expect(result).toEqual(mockCarousel);
    });
  });

  describe('update', () => {
    it('should update a carousel', async () => {
      const updateDto = { name: 'Updated Carousel' };
      const updatedCarousel = { ...mockCarousel, name: 'Updated Carousel' };

      mockCarouselsService.update.mockResolvedValue(updatedCarousel);

      const result = await controller.update(mockCarousel.id, updateDto);

      expect(service.update).toHaveBeenCalledWith(mockCarousel.id, updateDto);
      expect(result).toEqual(updatedCarousel);
    });
  });

  describe('reorderSlides', () => {
    it('should reorder slides in a carousel', async () => {
      const slideOrders = [
        { id: 'slide-1', order: 2 },
        { id: 'slide-2', order: 1 },
      ];

      mockCarouselsService.reorderSlides.mockResolvedValue(mockCarousel);

      const result = await controller.reorderSlides(
        mockCarousel.id,
        slideOrders,
      );

      expect(service.reorderSlides).toHaveBeenCalledWith(
        mockCarousel.id,
        slideOrders,
      );
      expect(result).toEqual(mockCarousel);
    });
  });

  describe('remove', () => {
    it('should remove a carousel', async () => {
      mockCarouselsService.remove.mockResolvedValue(undefined);

      await controller.remove(mockCarousel.id);

      expect(service.remove).toHaveBeenCalledWith(mockCarousel.id);
    });
  });
});
