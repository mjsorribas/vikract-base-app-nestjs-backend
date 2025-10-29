import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductCategory } from './entities/product-category.entity';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { UpdateProductCategoryDto } from './dto/update-product-category.dto';

@Injectable()
export class ProductCategoriesService {
  constructor(
    @InjectRepository(ProductCategory)
    private readonly categoryRepository: Repository<ProductCategory>,
  ) {}

  async create(
    createCategoryDto: CreateProductCategoryDto,
  ): Promise<ProductCategory> {
    const category = this.categoryRepository.create({
      ...createCategoryDto,
      isActive: createCategoryDto.isActive ?? true,
      sortOrder: createCategoryDto.sortOrder ?? 0,
    });

    return this.categoryRepository.save(category);
  }

  async findAll(): Promise<ProductCategory[]> {
    return this.categoryRepository.find({
      relations: ['products'],
      order: {
        sortOrder: 'ASC',
        name: 'ASC',
      },
    });
  }

  async findActive(): Promise<ProductCategory[]> {
    return this.categoryRepository.find({
      where: { isActive: true },
      relations: ['products'],
      order: {
        sortOrder: 'ASC',
        name: 'ASC',
      },
    });
  }

  async findBySlug(slug: string): Promise<ProductCategory> {
    const category = await this.categoryRepository.findOne({
      where: { slug },
      relations: ['products'],
    });

    if (!category) {
      throw new NotFoundException(`Category with slug ${slug} not found`);
    }

    return category;
  }

  async findOne(id: string): Promise<ProductCategory> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['products'],
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  async update(
    id: string,
    updateCategoryDto: UpdateProductCategoryDto,
  ): Promise<ProductCategory> {
    const category = await this.findOne(id);

    Object.assign(category, updateCategoryDto);

    return this.categoryRepository.save(category);
  }

  async remove(id: string): Promise<void> {
    const category = await this.findOne(id);
    await this.categoryRepository.remove(category);
  }
}
