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
@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule,
    RolesModule,
    UsersModule,
    LanguagesModule,
    BlogsModule,
    ArticlesModule,
    CategoriesModule,
    TagsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
