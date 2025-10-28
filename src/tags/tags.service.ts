import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Tag } from './entities/tag.entity';
import { TagTranslation } from './entities/tag-translation.entity';
import { Language } from '../languages/entities/language.entity';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { SlugGenerator } from '../common/utils/slug-generator';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private tagRepository: Repository<Tag>,
    @InjectRepository(TagTranslation)
    private tagTranslationRepository: Repository<TagTranslation>,
    @InjectRepository(Language)
    private languageRepository: Repository<Language>,
  ) {}

  async create(createTagDto: CreateTagDto): Promise<Tag> {
    const { translations } = createTagDto;

    // Get languages
    const languageIds = translations.map((t) => t.languageId);
    const languages = await this.languageRepository.find({
      where: { id: In(languageIds) },
    });

    // Generate base slug from default language or first translation
    const defaultTranslation = translations[0];
    const existingSlugs = await this.getExistingSlugs();
    const slug = SlugGenerator.generateUnique(defaultTranslation.name, existingSlugs);

    // Create tag
    const tag = this.tagRepository.create({ slug });
    const savedTag = await this.tagRepository.save(tag);

    // Create translations
    for (const translationDto of translations) {
      const language = languages.find((l) => l.id === translationDto.languageId);
      if (language) {
        const translationSlug = SlugGenerator.generate(translationDto.name);
        const translation = this.tagTranslationRepository.create({
          ...translationDto,
          slug: translationSlug,
          tag: savedTag,
          language,
        });
        await this.tagTranslationRepository.save(translation);
      }
    }

    return this.findOne(savedTag.id);
  }

  async findAll(languageCode?: string): Promise<Tag[]> {
    const query = this.tagRepository
      .createQueryBuilder('tag')
      .leftJoinAndSelect('tag.translations', 'translation')
      .leftJoinAndSelect('translation.language', 'language')
      .where('tag.deletedAt IS NULL');

    if (languageCode) {
      query.andWhere('language.code = :languageCode', { languageCode });
    }

    return query.getMany();
  }

  async findActive(languageCode?: string): Promise<Tag[]> {
    const query = this.tagRepository
      .createQueryBuilder('tag')
      .leftJoinAndSelect('tag.translations', 'translation')
      .leftJoinAndSelect('translation.language', 'language')
      .where('tag.isActive = :isActive', { isActive: true })
      .andWhere('tag.deletedAt IS NULL');

    if (languageCode) {
      query.andWhere('language.code = :languageCode', { languageCode });
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<Tag> {
    return this.tagRepository.findOne({
      where: { id },
      relations: ['translations', 'translations.language'],
    });
  }

  async findBySlug(slug: string, languageCode?: string): Promise<Tag> {
    const query = this.tagRepository
      .createQueryBuilder('tag')
      .leftJoinAndSelect('tag.translations', 'translation')
      .leftJoinAndSelect('translation.language', 'language')
      .where('tag.slug = :slug', { slug });

    if (languageCode) {
      query.andWhere('language.code = :languageCode', { languageCode });
    }

    return query.getOne();
  }

  async update(id: string, updateTagDto: UpdateTagDto): Promise<Tag> {
    const tag = await this.findOne(id);
    if (!tag) {
      throw new Error('Tag not found');
    }

    const { translations, ...updateData } = updateTagDto;

    // Update tag
    await this.tagRepository.update(id, updateData);

    // Update translations if provided
    if (translations && translations.length > 0) {
      // Remove existing translations
      await this.tagTranslationRepository.delete({ tag: { id } });

      // Add new translations
      const languageIds = translations.map((t) => t.languageId);
      const languages = await this.languageRepository.find({
        where: { id: In(languageIds) },
      });

      for (const translationDto of translations) {
        const language = languages.find((l) => l.id === translationDto.languageId);
        if (language) {
          const translationSlug = SlugGenerator.generate(translationDto.name);
          const translation = this.tagTranslationRepository.create({
            ...translationDto,
            slug: translationSlug,
            tag,
            language,
          });
          await this.tagTranslationRepository.save(translation);
        }
      }
    }

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.tagRepository.softDelete(id);
  }

  private async getExistingSlugs(excludeId?: string): Promise<string[]> {
    const query = this.tagRepository
      .createQueryBuilder('tag')
      .select('tag.slug')
      .where('tag.deletedAt IS NULL');

    if (excludeId) {
      query.andWhere('tag.id != :excludeId', { excludeId });
    }

    const tags = await query.getMany();
    return tags.map((tag) => tag.slug);
  }
}
