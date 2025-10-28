import { DataSourceOptions } from 'typeorm';
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

export class PGliteTypeORMAdapter {
  private pgliteInstance: PGlite;

  constructor() {
    this.initializePGlite();
  }

  private async initializePGlite() {
    try {
      // Initialize PGlite with a persistent directory
      this.pgliteInstance = new PGlite('./pglite_db', {
        debug: process.env.NODE_ENV === 'development' ? 1 : 0,
      });
      
      console.log('✅ PGlite database initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize PGlite database:', error);
      throw error;
    }
  }

  getDataSourceOptions(): DataSourceOptions {
    return {
      type: 'postgres',
      // Use PGlite connection
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '',
      database: 'pglite_db',
      entities,
      synchronize: true,
      logging: process.env.NODE_ENV === 'development',
      // Custom driver factory to use PGlite
      extra: {
        // Disable SSL for local PGlite
        ssl: false,
      },
    };
  }

  getPGliteInstance(): PGlite {
    return this.pgliteInstance;
  }

  async close() {
    if (this.pgliteInstance) {
      await this.pgliteInstance.close();
    }
  }
}