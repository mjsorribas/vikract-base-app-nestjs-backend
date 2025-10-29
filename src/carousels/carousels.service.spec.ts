import { Test, TestingModule } from '@nestjs/testing';
import { CarouselsService } from './carousels.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Carousel } from './entities/carousel.entity';
import { CarouselSlide } from './entities/carousel-slide.entity';
import { Article } from '../articles/entities/article.entity';
import { NotFoundException } from '@nestjs/common';

describe('CarouselsService', () => {
  let service: CarouselsService;
  let carouselRepository: Repository<Carousel>;
  let slideRepository: Repository<CarouselSlide>;
  let articleRepository: Repository<Article>;

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
    page: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCarouselRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockSlideRepository = {
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  };

  const mockArticleRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CarouselsService,
        {
          provide: getRepositoryToken(Carousel),
          useValue: mockCarouselRepository,
        },
        {
          provide: getRepositoryToken(CarouselSlide),
          useValue: mockSlideRepository,
        },
        {
          provide: getRepositoryToken(Article),
          useValue: mockArticleRepository,
        },
      ],
    }).compile();

    service = module.get<CarouselsService>(CarouselsService);
    carouselRepository = module.get<Repository<Carousel>>(
      getRepositoryToken(Carousel),
    );
    slideRepository = module.get<Repository<CarouselSlide>>(
      getRepositoryToken(CarouselSlide),
    );
    articleRepository = module.get<Repository<Article>>(
      getRepositoryToken(Article),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a carousel without slides', async () => {
      const createDto = {
        name: 'Test Carousel',
        description: 'Test description',
      };

      mockCarouselRepository.create.mockReturnValue(mockCarousel);
      mockCarouselRepository.save.mockResolvedValue(mockCarousel);
      jest.spyOn(service, 'findOne').mockResolvedValue(mockCarousel);

      const result = await service.create(createDto);

      expect(carouselRepository.create).toHaveBeenCalledWith({
        name: createDto.name,
        description: createDto.description,
        isActive: true,
        autoplayDelay: 0,
        showIndicators: true,
        showNavigation: true,
      });
      expect(result).toEqual(mockCarousel);
    });

    it('should create a carousel with slides', async () => {
      const createDto = {
        name: 'Test Carousel',
        slides: [
          {
            imageUrl: 'https://example.com/image1.jpg',
            title: 'Slide 1',
            order: 1,
          },
        ],
      };

      const mockSlide = {
        id: 'slide-1',
        imageUrl: 'https://example.com/image1.jpg',
        title: 'Slide 1',
        description: null,
        linkUrl: null,
        linkTarget: '_self',
        order: 1,
        isActive: true,
        altText: null,
        carousel: mockCarousel,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCarouselRepository.create.mockReturnValue(mockCarousel);
      mockCarouselRepository.save.mockResolvedValue(mockCarousel);
      mockSlideRepository.create.mockReturnValue(mockSlide);
      mockSlideRepository.save.mockResolvedValue([mockSlide]);
      jest.spyOn(service, 'findOne').mockResolvedValue({
        ...mockCarousel,
        slides: [mockSlide],
      });

      const result = await service.create(createDto);

      expect(slideRepository.create).toHaveBeenCalled();
      expect(slideRepository.save).toHaveBeenCalled();
      expect(result.slides).toHaveLength(1);
    });
  });

  describe('findAll', () => {
    it('should return all carousels', async () => {
      mockCarouselRepository.find.mockResolvedValue([mockCarousel]);

      const result = await service.findAll();

      expect(carouselRepository.find).toHaveBeenCalledWith({
        relations: ['slides', 'article'],
        order: {
          createdAt: 'DESC',
          slides: {
            order: 'ASC',
          },
        },
      });
      expect(result).toEqual([mockCarousel]);
    });
  });

  describe('findActive', () => {
    it('should return only active carousels', async () => {
      mockCarouselRepository.find.mockResolvedValue([mockCarousel]);

      const result = await service.findActive();

      expect(carouselRepository.find).toHaveBeenCalledWith({
        where: { isActive: true },
        relations: ['slides', 'article'],
        order: {
          createdAt: 'DESC',
          slides: {
            order: 'ASC',
          },
        },
      });
      expect(result).toEqual([mockCarousel]);
    });
  });

  describe('findOne', () => {
    it('should return a carousel by id', async () => {
      mockCarouselRepository.findOne.mockResolvedValue(mockCarousel);

      const result = await service.findOne(mockCarousel.id);

      expect(carouselRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockCarousel.id },
        relations: ['slides', 'article'],
        order: {
          slides: {
            order: 'ASC',
          },
        },
      });
      expect(result).toEqual(mockCarousel);
    });

    it('should throw NotFoundException if carousel not found', async () => {
      mockCarouselRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a carousel', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockCarousel);
      mockCarouselRepository.remove.mockResolvedValue(mockCarousel);

      await service.remove(mockCarousel.id);

      expect(service.findOne).toHaveBeenCalledWith(mockCarousel.id);
      expect(carouselRepository.remove).toHaveBeenCalledWith(mockCarousel);
    });
  });
});
