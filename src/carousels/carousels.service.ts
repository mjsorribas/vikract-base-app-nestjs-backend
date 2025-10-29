import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Carousel } from './entities/carousel.entity';
import { CarouselSlide } from './entities/carousel-slide.entity';
import { Article } from '../articles/entities/article.entity';
import { CreateCarouselDto } from './dto/create-carousel.dto';
import { UpdateCarouselDto } from './dto/update-carousel.dto';

@Injectable()
export class CarouselsService {
  constructor(
    @InjectRepository(Carousel)
    private readonly carouselRepository: Repository<Carousel>,
    @InjectRepository(CarouselSlide)
    private readonly carouselSlideRepository: Repository<CarouselSlide>,
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
  ) {}

  async create(createCarouselDto: CreateCarouselDto): Promise<Carousel> {
    const carousel = this.carouselRepository.create({
      name: createCarouselDto.name,
      description: createCarouselDto.description,
      isActive: createCarouselDto.isActive ?? true,
      autoplayDelay: createCarouselDto.autoplayDelay ?? 0,
      showIndicators: createCarouselDto.showIndicators ?? true,
      showNavigation: createCarouselDto.showNavigation ?? true,
    });

    // Si se proporciona un articleId, asociar el carousel al artículo
    if (createCarouselDto.articleId) {
      const article = await this.articleRepository.findOne({
        where: { id: createCarouselDto.articleId },
      });
      if (!article) {
        throw new NotFoundException(
          `Article with ID ${createCarouselDto.articleId} not found`,
        );
      }
      carousel.article = article;
    }

    const savedCarousel = await this.carouselRepository.save(carousel);

    // Crear slides si se proporcionan
    if (createCarouselDto.slides && createCarouselDto.slides.length > 0) {
      const slides = createCarouselDto.slides.map((slideDto) =>
        this.carouselSlideRepository.create({
          ...slideDto,
          carousel: savedCarousel,
          linkTarget: slideDto.linkTarget ?? '_self',
          isActive: slideDto.isActive ?? true,
        }),
      );

      await this.carouselSlideRepository.save(slides);
    }

    return this.findOne(savedCarousel.id);
  }

  async findAll(): Promise<Carousel[]> {
    return this.carouselRepository.find({
      relations: ['slides', 'article'],
      order: {
        createdAt: 'DESC',
        slides: {
          order: 'ASC',
        },
      },
    });
  }

  async findActive(): Promise<Carousel[]> {
    return this.carouselRepository.find({
      where: { isActive: true },
      relations: ['slides', 'article'],
      order: {
        createdAt: 'DESC',
        slides: {
          order: 'ASC',
        },
      },
    });
  }

  async findByArticle(articleId: string): Promise<Carousel[]> {
    return this.carouselRepository.find({
      where: { article: { id: articleId }, isActive: true },
      relations: ['slides'],
      order: {
        createdAt: 'DESC',
        slides: {
          order: 'ASC',
        },
      },
    });
  }

  async findOne(id: string): Promise<Carousel> {
    const carousel = await this.carouselRepository.findOne({
      where: { id },
      relations: ['slides', 'article'],
      order: {
        slides: {
          order: 'ASC',
        },
      },
    });

    if (!carousel) {
      throw new NotFoundException(`Carousel with ID ${id} not found`);
    }

    return carousel;
  }

  async update(
    id: string,
    updateCarouselDto: UpdateCarouselDto,
  ): Promise<Carousel> {
    const carousel = await this.findOne(id);

    // Actualizar propiedades del carousel
    Object.assign(carousel, updateCarouselDto);

    // Si se proporciona un nuevo articleId, actualizar la asociación
    if (updateCarouselDto.articleId !== undefined) {
      if (updateCarouselDto.articleId) {
        const article = await this.articleRepository.findOne({
          where: { id: updateCarouselDto.articleId },
        });
        if (!article) {
          throw new NotFoundException(
            `Article with ID ${updateCarouselDto.articleId} not found`,
          );
        }
        carousel.article = article;
      } else {
        carousel.article = null;
      }
    }

    await this.carouselRepository.save(carousel);

    // Si se proporcionan slides, reemplazar los existentes
    if (updateCarouselDto.slides) {
      // Eliminar slides existentes
      await this.carouselSlideRepository.delete({ carousel: { id } });

      // Crear nuevos slides
      if (updateCarouselDto.slides.length > 0) {
        const slides = updateCarouselDto.slides.map((slideDto) =>
          this.carouselSlideRepository.create({
            ...slideDto,
            carousel,
            linkTarget: slideDto.linkTarget ?? '_self',
            isActive: slideDto.isActive ?? true,
          }),
        );

        await this.carouselSlideRepository.save(slides);
      }
    }

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const carousel = await this.findOne(id);
    await this.carouselRepository.remove(carousel);
  }

  async reorderSlides(
    carouselId: string,
    slideOrders: { id: string; order: number }[],
  ): Promise<Carousel> {
    await this.findOne(carouselId);

    for (const { id, order } of slideOrders) {
      await this.carouselSlideRepository.update(
        { id, carousel: { id: carouselId } },
        { order },
      );
    }

    return this.findOne(carouselId);
  }
}
