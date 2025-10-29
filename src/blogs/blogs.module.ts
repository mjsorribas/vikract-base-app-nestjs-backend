import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogsService } from './blogs.service';
import { BlogsAdminController } from './blogs-admin.controller';
import { BlogsPublicController } from './blogs-public.controller';
import { Blog } from './entities/blog.entity';
import { User } from '../users/entities/user.entity';
import { ApiKeysModule } from '../api-keys/api-keys.module';

@Module({
  imports: [TypeOrmModule.forFeature([Blog, User]), ApiKeysModule],
  controllers: [BlogsAdminController, BlogsPublicController],
  providers: [BlogsService],
  exports: [BlogsService],
})
export class BlogsModule {}
