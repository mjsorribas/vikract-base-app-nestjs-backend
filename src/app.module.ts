import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { RolesModule } from './roles/roles.module';
import { UsersModule } from './users/users.module';
import { LanguagesModule } from './languages/languages.module';
import { BlogsModule } from './blogs/blogs.module';
import { ArticlesModule } from './articles/articles.module';
import { CategoriesModule } from './categories/categories.module';
import { TagsModule } from './tags/tags.module';
import { AuthModule } from './auth/auth.module';
import { ApiKeysModule } from './api-keys/api-keys.module';
import { StorageModule } from './storage/storage.module';
import { CarouselsModule } from './carousels/carousels.module';
import { ProductCategoriesModule } from './product-categories/product-categories.module';
import { ProductsModule } from './products/products.module';
import { BrandsModule } from './brands/brands.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule,
    AuthModule,
    ApiKeysModule,
    RolesModule,
    UsersModule,
    LanguagesModule,
    BlogsModule,
    ArticlesModule,
    CategoriesModule,
    TagsModule,
    StorageModule,
    CarouselsModule,
    ProductCategoriesModule,
    ProductsModule,
    BrandsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
