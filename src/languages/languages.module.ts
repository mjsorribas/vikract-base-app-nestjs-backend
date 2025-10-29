import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LanguagesService } from './languages.service';
import { LanguagesAdminController } from './languages-admin.controller';
import { LanguagesPublicController } from './languages-public.controller';
import { Language } from './entities/language.entity';
import { ApiKeysModule } from '../api-keys/api-keys.module';

@Module({
  imports: [TypeOrmModule.forFeature([Language]), ApiKeysModule],
  controllers: [LanguagesAdminController, LanguagesPublicController],
  providers: [LanguagesService],
  exports: [LanguagesService],
})
export class LanguagesModule {}
