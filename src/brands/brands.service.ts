import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Brand } from './entities/brand.entity';
import { ProductCategory } from '../product-categories/entities/product-category.entity';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { PublicBrandDto } from './dto/public-brand.dto';

@Injectable()
export class BrandsService {
  constructor(
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
    @InjectRepository(ProductCategory)
    private readonly categoryRepository: Repository<ProductCategory>,
  ) {}

  async create(createBrandDto: CreateBrandDto): Promise<Brand> {
    // Verificar que las categorías existen si se proporcionan
    let categories: ProductCategory[] = [];
    if (createBrandDto.categoryIds && createBrandDto.categoryIds.length > 0) {
      categories = await this.categoryRepository.find({
        where: { id: In(createBrandDto.categoryIds) },
      });

      if (categories.length !== createBrandDto.categoryIds.length) {
        throw new NotFoundException('One or more categories not found');
      }
    }

    const { categoryIds, ...brandData } = createBrandDto;
    
    // Crear la marca
    const brand = this.brandRepository.create({
      ...brandData,
      isActive: brandData.isActive ?? true,
      sortOrder: brandData.sortOrder ?? 0,
      categories,
    });

    return this.brandRepository.save(brand);
  }

  async findAll(): Promise<Brand[]> {
    return this.brandRepository.find({
      relations: ['categories', 'products'],
      order: {
        sortOrder: 'ASC',
        name: 'ASC',
      },
    });
  }

  async findActive(): Promise<Brand[]> {
    return this.brandRepository.find({
      where: { isActive: true },
      relations: ['categories', 'products'],
      order: {
        sortOrder: 'ASC',
        name: 'ASC',
      },
    });
  }

  async findBySlug(slug: string): Promise<Brand> {
    const brand = await this.brandRepository.findOne({
      where: { slug },
      relations: ['categories', 'products'],
    });

    if (!brand) {
      throw new NotFoundException(`Brand with slug ${slug} not found`);
    }

    return brand;
  }

  async findOne(id: string): Promise<Brand> {
    const brand = await this.brandRepository.findOne({
      where: { id },
      relations: ['categories', 'products'],
    });

    if (!brand) {
      throw new NotFoundException(`Brand with ID ${id} not found`);
    }

    return brand;
  }

  async update(id: string, updateBrandDto: UpdateBrandDto): Promise<Brand> {
    const brand = await this.findOne(id);

    // Actualizar categorías si se proporcionan
    if (updateBrandDto.categoryIds !== undefined) {
      let categories: ProductCategory[] = [];
      if (updateBrandDto.categoryIds.length > 0) {
        categories = await this.categoryRepository.find({
          where: { id: In(updateBrandDto.categoryIds) },
        });

        if (categories.length !== updateBrandDto.categoryIds.length) {
          throw new NotFoundException('One or more categories not found');
        }
      }
      brand.categories = categories;
    }

    const { categoryIds, ...brandData } = updateBrandDto;
    
    // Actualizar propiedades de la marca
    Object.assign(brand, brandData);

    return this.brandRepository.save(brand);
  }

  async remove(id: string): Promise<void> {
    const brand = await this.findOne(id);
    await this.brandRepository.remove(brand);
  }

  // Método para obtener marcas para el frontend público
  async findPublicBrands(): Promise<PublicBrandDto[]> {
    const brands = await this.findActive();
    return brands.map((brand) => new PublicBrandDto(brand));
  }

  async findPublicBySlug(slug: string): Promise<PublicBrandDto> {
    const brand = await this.findBySlug(slug);
    return new PublicBrandDto(brand);
  }

  async findByCategory(categoryId: string): Promise<Brand[]> {
    return this.brandRepository
      .createQueryBuilder('brand')
      .leftJoinAndSelect('brand.categories', 'category')
      .leftJoinAndSelect('brand.products', 'products')
      .where('category.id = :categoryId', { categoryId })
      .andWhere('brand.isActive = :isActive', { isActive: true })
      .orderBy('brand.sortOrder', 'ASC')
      .addOrderBy('brand.name', 'ASC')
      .getMany();
  }

  async addCategories(brandId: string, categoryIds: string[]): Promise<Brand> {
    const brand = await this.findOne(brandId);
    
    const categories = await this.categoryRepository.find({
      where: { id: In(categoryIds) },
    });

    if (categories.length !== categoryIds.length) {
      throw new NotFoundException('One or more categories not found');
    }

    // Agregar categorías que no estén ya asociadas
    const existingCategoryIds = brand.categories.map((cat) => cat.id);
    const newCategories = categories.filter(
      (cat) => !existingCategoryIds.includes(cat.id),
    );
    
    brand.categories = [...brand.categories, ...newCategories];
    
    return this.brandRepository.save(brand);
  }

  async removeCategories(
    brandId: string,
    categoryIds: string[],
  ): Promise<Brand> {
    const brand = await this.findOne(brandId);
    
    brand.categories = brand.categories.filter(
      (category) => !categoryIds.includes(category.id),
    );
    
    return this.brandRepository.save(brand);
  }
}
