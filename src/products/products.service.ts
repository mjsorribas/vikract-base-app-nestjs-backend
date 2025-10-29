import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductMedia, MediaType } from './entities/product-media.entity';
import { ProductCategory } from '../product-categories/entities/product-category.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PublicProductDto } from './dto/public-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductMedia)
    private readonly mediaRepository: Repository<ProductMedia>,
    @InjectRepository(ProductCategory)
    private readonly categoryRepository: Repository<ProductCategory>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    // Verificar que la categoría existe
    const category = await this.categoryRepository.findOne({
      where: { id: createProductDto.categoryId },
    });

    if (!category) {
      throw new NotFoundException(
        `Category with ID ${createProductDto.categoryId} not found`,
      );
    }

    // Crear el producto
    const product = this.productRepository.create({
      ...createProductDto,
      category,
      isOfferActive: createProductDto.isOfferActive ?? false,
      availableStock: createProductDto.availableStock ?? 0,
      stockLimit: createProductDto.stockLimit ?? 0,
      hasShipping: createProductDto.hasShipping ?? true,
      hasPickup: createProductDto.hasPickup ?? true,
      isActive: createProductDto.isActive ?? true,
    });

    const savedProduct = await this.productRepository.save(product);

    // Crear medios si se proporcionan
    if (createProductDto.media && createProductDto.media.length > 0) {
      // Limitar a 10 imágenes y 5 videos
      const images = createProductDto.media
        .filter((m) => m.type === MediaType.IMAGE)
        .slice(0, 10);
      const videos = createProductDto.media
        .filter((m) => m.type === MediaType.VIDEO)
        .slice(0, 5);

      const allowedMedia = [...images, ...videos];

      const mediaEntities = allowedMedia.map((mediaDto) =>
        this.mediaRepository.create({
          ...mediaDto,
          product: savedProduct,
          sortOrder: mediaDto.sortOrder ?? 0,
        }),
      );

      await this.mediaRepository.save(mediaEntities);
    }

    return this.findOne(savedProduct.id);
  }

  async findAll(): Promise<Product[]> {
    return this.productRepository.find({
      relations: ['category', 'media'],
      order: {
        createdAt: 'DESC',
        media: {
          sortOrder: 'ASC',
        },
      },
    });
  }

  async findActive(): Promise<Product[]> {
    return this.productRepository.find({
      where: { isActive: true },
      relations: ['category', 'media'],
      order: {
        createdAt: 'DESC',
        media: {
          sortOrder: 'ASC',
        },
      },
    });
  }

  async findInStock(): Promise<Product[]> {
    return this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.media', 'media')
      .where('product.isActive = :isActive', { isActive: true })
      .andWhere('product.availableStock > product.stockLimit')
      .orderBy('product.createdAt', 'DESC')
      .addOrderBy('media.sortOrder', 'ASC')
      .getMany();
  }

  async findByCategory(categoryId: string): Promise<Product[]> {
    return this.productRepository.find({
      where: { category: { id: categoryId }, isActive: true },
      relations: ['category', 'media'],
      order: {
        createdAt: 'DESC',
        media: {
          sortOrder: 'ASC',
        },
      },
    });
  }

  async findBySlug(slug: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { slug },
      relations: ['category', 'media'],
      order: {
        media: {
          sortOrder: 'ASC',
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with slug ${slug} not found`);
    }

    return product;
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category', 'media'],
      order: {
        media: {
          sortOrder: 'ASC',
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.findOne(id);

    // Si se actualiza la categoría, verificar que existe
    if (updateProductDto.categoryId) {
      const category = await this.categoryRepository.findOne({
        where: { id: updateProductDto.categoryId },
      });

      if (!category) {
        throw new NotFoundException(
          `Category with ID ${updateProductDto.categoryId} not found`,
        );
      }

      product.category = category;
    }

    // Actualizar propiedades del producto
    Object.assign(product, updateProductDto);

    await this.productRepository.save(product);

    // Si se proporcionan medios, reemplazar los existentes
    if (updateProductDto.media) {
      // Eliminar medios existentes
      await this.mediaRepository.delete({ product: { id } });

      // Crear nuevos medios
      if (updateProductDto.media.length > 0) {
        const images = updateProductDto.media
          .filter((m) => m.type === MediaType.IMAGE)
          .slice(0, 10);
        const videos = updateProductDto.media
          .filter((m) => m.type === MediaType.VIDEO)
          .slice(0, 5);

        const allowedMedia = [...images, ...videos];

        const mediaEntities = allowedMedia.map((mediaDto) =>
          this.mediaRepository.create({
            ...mediaDto,
            product,
            sortOrder: mediaDto.sortOrder ?? 0,
          }),
        );

        await this.mediaRepository.save(mediaEntities);
      }
    }

    return this.findOne(id);
  }

  async updateStock(id: string, newStock: number): Promise<Product> {
    const product = await this.findOne(id);
    product.availableStock = newStock;
    await this.productRepository.save(product);
    return product;
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }

  // Método para obtener productos para el frontend público (sin información sensible)
  async findPublicProducts(): Promise<PublicProductDto[]> {
    const products = await this.findActive();
    return products.map((product) => this.toPublicDto(product));
  }

  async findPublicBySlug(slug: string): Promise<PublicProductDto> {
    const product = await this.findBySlug(slug);
    return this.toPublicDto(product);
  }

  async findPublicByCategory(categoryId: string): Promise<PublicProductDto[]> {
    const products = await this.findByCategory(categoryId);
    return products.map((product) => this.toPublicDto(product));
  }

  private toPublicDto(product: Product): PublicProductDto {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { purchasePrice, stockLimit, ...publicData } = product;

    return {
      ...publicData,
      isInStock: product.isInStock,
      currentPrice: product.currentPrice,
      isOnSale: product.isOnSale,
    };
  }
}
