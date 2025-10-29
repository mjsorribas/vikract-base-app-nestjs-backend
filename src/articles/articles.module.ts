import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticlesService } from './articles.service';
import { ArticlesAdminController } from './articles-admin.controller';
import { ArticlesPublicController } from './articles-public.controller';
import { Article } from './entities/article.entity';
import { ArticleTranslation } from './entities/article-translation.entity';
import { Blog } from '../blogs/entities/blog.entity';
import { User } from '../users/entities/user.entity';
import { Category } from '../categories/entities/category.entity';
import { Tag } from '../tags/entities/tag.entity';
import { Language } from '../languages/entities/language.entity';
import { ApiKeysModule } from '../api-keys/api-keys.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Article,
      ArticleTranslation,
      Blog,
      User,
      Category,
      Tag,
      Language,
    ]),
    ApiKeysModule,
  ],
  controllers: [ArticlesAdminController, ArticlesPublicController],
  providers: [ArticlesService],
  exports: [ArticlesService],
})
export class ArticlesModule {}
