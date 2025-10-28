import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PGlite } from '@electric-sql/pglite';

// Import entities
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { Blog } from '../blogs/entities/blog.entity';
import { Article } from '../articles/entities/article.entity';
import { Category } from '../categories/entities/category.entity';
import { Tag } from '../tags/entities/tag.entity';
import { Language } from '../languages/entities/language.entity';
import { ArticleTranslation } from '../articles/entities/article-translation.entity';
import { CategoryTranslation } from '../categories/entities/category-translation.entity';
import { TagTranslation } from '../tags/entities/tag-translation.entity';
import { SeedService } from './seed.service';
import { RolesModule } from '../roles/roles.module';
import { LanguagesModule } from '../languages/languages.module';
import { UsersModule } from '../users/users.module';

const entities = [
  User,
  Role,
  Blog,
  Article,
  Category,
  Tag,
  Language,
  ArticleTranslation,
  CategoryTranslation,
  TagTranslation,
];

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: async () => {
        // For now, use sqlite until PGlite configuration is fixed
        return {
          type: 'sqlite',
          database: ':memory:',
          entities,
          synchronize: true,
          logging: process.env.NODE_ENV === 'development',
        };
      },
    }),
    RolesModule,
    LanguagesModule,
    UsersModule,
  ],
  providers: [SeedService],
})
export class DatabaseModule {}