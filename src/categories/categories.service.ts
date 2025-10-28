import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Category } from './entities/category.entity';
import { CategoryTranslation } from './entities/category-translation.entity';
import { Language } from '../languages/entities/language.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { SlugGenerator } from '../common/utils/slug-generator';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(CategoryTranslation)
    private categoryTranslationRepository: Repository<CategoryTranslation>,
    @InjectRepository(Language)
    private languageRepository: Repository<Language>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const { translations, ...categoryData } = createCategoryDto;

    // Get languages
    const languageIds = translations.map((t) => t.languageId);
    const languages = await this.languageRepository.find({
      where: { id: In(languageIds) },
    });

    // Generate base slug from default language or first translation
    const defaultTranslation = translations[0];
    const baseSlug = SlugGenerator.generate(defaultTranslation.name);
    const existingSlugs = await this.getExistingSlugs();
    const slug = SlugGenerator.generateUnique(defaultTranslation.name, existingSlugs);

    // Create category
    const category = this.categoryRepository.create({
      ...categoryData,
      slug,
    });

    const savedCategory = await this.categoryRepository.save(category);

    // Create translations
    for (const translationDto of translations) {
      const language = languages.find((l) => l.id === translationDto.languageId);
      if (language) {
        const translationSlug = SlugGenerator.generate(translationDto.name);
        const translation = this.categoryTranslationRepository.create({
          ...translationDto,
          slug: translationSlug,
          category: savedCategory,
          language,
        });
        await this.categoryTranslationRepository.save(translation);
      }
    }

    return this.findOne(savedCategory.id);
  }

  async findAll(languageCode?: string): Promise<Category[]> {
    const query = this.categoryRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.translations', 'translation')
      .leftJoinAndSelect('translation.language', 'language')
      .where('category.deletedAt IS NULL');

    if (languageCode) {
      query.andWhere('language.code = :languageCode', { languageCode });
    }

    return query.getMany();
  }

  async findActive(languageCode?: string): Promise<Category[]> {
    const query = this.categoryRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.translations', 'translation')
      .leftJoinAndSelect('translation.language', 'language')
      .where('category.isActive = :isActive', { isActive: true })
      .andWhere('category.deletedAt IS NULL');

    if (languageCode) {
      query.andWhere('language.code = :languageCode', { languageCode });
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<Category> {
    return this.categoryRepository.findOne({
      where: { id },
      relations: ['translations', 'translations.language'],
    });
  }

  async findBySlug(slug: string, languageCode?: string): Promise<Category> {
    const query = this.categoryRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.translations', 'translation')
      .leftJoinAndSelect('translation.language', 'language')
      .where('category.slug = :slug', { slug });

    if (languageCode) {
      query.andWhere('language.code = :languageCode', { languageCode });
    }

    return query.getOne();
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id);
    if (!category) {
      throw new Error('Category not found');
    }

    const { translations, ...updateData } = updateCategoryDto;

    // Update category
    await this.categoryRepository.update(id, updateData);

    // Update translations if provided
    if (translations && translations.length > 0) {
      // Remove existing translations
      await this.categoryTranslationRepository.delete({ category: { id } });

      // Add new translations
      const languageIds = translations.map((t) => t.languageId);
      const languages = await this.languageRepository.find({
        where: { id: In(languageIds) },
      });

      for (const translationDto of translations) {
        const language = languages.find((l) => l.id === translationDto.languageId);
        if (language) {
          const translationSlug = SlugGenerator.generate(translationDto.name);
          const translation = this.categoryTranslationRepository.create({
            ...translationDto,
            slug: translationSlug,
            category,
            language,
          });
          await this.categoryTranslationRepository.save(translation);
        }
      }
    }

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.categoryRepository.softDelete(id);
  }

  private async getExistingSlugs(excludeId?: string): Promise<string[]> {
    const query = this.categoryRepository
      .createQueryBuilder('category')
      .select('category.slug')
      .where('category.deletedAt IS NULL');

    if (excludeId) {
      query.andWhere('category.id != :excludeId', { excludeId });
    }

    const categories = await query.getMany();
    return categories.map((category) => category.slug);
  }
}
