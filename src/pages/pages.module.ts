import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PagesService } from './pages.service';
import { PagesAdminController } from './pages-admin.controller';
import { PagesPublicController } from './pages-public.controller';
import { Page } from './entities/page.entity';
import { ApiKeysModule } from '../api-keys/api-keys.module';

@Module({
  imports: [TypeOrmModule.forFeature([Page]), ApiKeysModule],
  controllers: [PagesAdminController, PagesPublicController],
  providers: [PagesService],
  exports: [PagesService, TypeOrmModule],
})
export class PagesModule {}
