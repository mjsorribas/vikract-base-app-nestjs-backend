import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

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
import { ApiKey } from '../api-keys/entities/api-key.entity';
import { Carousel } from '../carousels/entities/carousel.entity';
import { CarouselSlide } from '../carousels/entities/carousel-slide.entity';
import { ProductCategory } from '../product-categories/entities/product-category.entity';
import { Product } from '../products/entities/product.entity';
import { ProductMedia } from '../products/entities/product-media.entity';
import { Brand } from '../brands/entities/brand.entity';
import { Page } from '../pages/entities/page.entity';
import { SeedService } from './seed.service';
import { PGliteService } from './pglite.service';
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
  ApiKey,
  Carousel,
  CarouselSlide,
  ProductCategory,
  Product,
  ProductMedia,
  Brand,
  Page,
];

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: async () => {
        // Use better-sqlite3 for TypeORM compatibility
        // PGlite will be available through PGliteService for advanced operations
        return {
          type: 'better-sqlite3',
          database: './pglite_db/database.sqlite',
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
  providers: [SeedService, PGliteService],
  exports: [PGliteService],
})
export class DatabaseModule {}
