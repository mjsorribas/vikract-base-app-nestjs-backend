import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Language } from './entities/language.entity';
import { CreateLanguageDto } from './dto/create-language.dto';
import { UpdateLanguageDto } from './dto/update-language.dto';

@Injectable()
export class LanguagesService {
  constructor(
    @InjectRepository(Language)
    private languageRepository: Repository<Language>,
  ) {}

  async create(createLanguageDto: CreateLanguageDto): Promise<Language> {
    // If setting as default, unset other defaults
    if (createLanguageDto.isDefault) {
      await this.languageRepository.update(
        { isDefault: true },
        { isDefault: false },
      );
    }

    const language = this.languageRepository.create(createLanguageDto);
    return this.languageRepository.save(language);
  }

  async findAll(): Promise<Language[]> {
    return this.languageRepository.find({
      where: { deletedAt: null },
      order: { isDefault: 'DESC', name: 'ASC' },
    });
  }

  async findActive(): Promise<Language[]> {
    return this.languageRepository.find({
      where: { isActive: true, deletedAt: null },
      order: { isDefault: 'DESC', name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Language> {
    return this.languageRepository.findOne({ where: { id } });
  }

  async findByCode(code: string): Promise<Language> {
    return this.languageRepository.findOne({ where: { code } });
  }

  async findDefault(): Promise<Language> {
    return this.languageRepository.findOne({ where: { isDefault: true } });
  }

  async update(id: string, updateLanguageDto: UpdateLanguageDto): Promise<Language> {
    // If setting as default, unset other defaults
    if (updateLanguageDto.isDefault) {
      await this.languageRepository.update(
        { isDefault: true },
        { isDefault: false },
      );
    }

    await this.languageRepository.update(id, updateLanguageDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.languageRepository.softDelete(id);
  }
}
