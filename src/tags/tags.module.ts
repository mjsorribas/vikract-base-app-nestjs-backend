import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TagsService } from './tags.service';
import { TagsAdminController } from './tags-admin.controller';
import { TagsPublicController } from './tags-public.controller';
import { Tag } from './entities/tag.entity';
import { TagTranslation } from './entities/tag-translation.entity';
import { Language } from '../languages/entities/language.entity';
import { ApiKeysModule } from '../api-keys/api-keys.module';

@Module({
  imports: [TypeOrmModule.forFeature([Tag, TagTranslation, Language]), ApiKeysModule],
  controllers: [TagsAdminController, TagsPublicController],
  providers: [TagsService],
  exports: [TagsService],
})
export class TagsModule {}
