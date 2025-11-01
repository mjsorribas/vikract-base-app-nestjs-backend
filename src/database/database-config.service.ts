import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

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

export type DatabaseMode = 'sqlite' | 'postgres' | 'hybrid';

@Injectable()
export class DatabaseConfigService {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const databaseMode = this.getDatabaseMode();
    const isProduction = this.configService.get('NODE_ENV') === 'production';
    const isDevelopment = this.configService.get('NODE_ENV') === 'development';

    console.log(`🗄️ Database mode: ${databaseMode}`);

    switch (databaseMode) {
      case 'postgres':
        return this.getPostgreSQLConfig(isProduction);
      
      case 'hybrid':
        // En desarrollo: SQLite para TypeORM + PGlite para funciones avanzadas
        // En producción: PostgreSQL para TypeORM + PostgreSQL nativo para funciones avanzadas
        return isProduction 
          ? this.getPostgreSQLConfig(true)
          : this.getSQLiteConfig(isDevelopment);
      
      case 'sqlite':
      default:
        return this.getSQLiteConfig(isDevelopment);
    }
  }

  private getDatabaseMode(): DatabaseMode {
    return this.configService.get<DatabaseMode>('DATABASE_MODE', 'hybrid');
  }

  private getPostgreSQLConfig(isProduction: boolean): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.configService.get('DATABASE_HOST', 'localhost'),
      port: this.configService.get('DATABASE_PORT', 5432),
      username: this.configService.get('DATABASE_USERNAME', 'postgres'),
      password: this.configService.get('DATABASE_PASSWORD', ''),
      database: this.configService.get('DATABASE_NAME', 'vikract'),
      entities,
      synchronize: !isProduction, // Solo en desarrollo
      logging: !isProduction,
      ssl: isProduction ? { rejectUnauthorized: false } : false,
      // Configuraciones de producción
      ...(isProduction && {
        poolSize: 20,
        connectTimeoutMS: 60000,
        acquireTimeoutMS: 60000,
        timeout: 60000,
        extra: {
          max: 20,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 2000,
        },
      }),
    };
  }

  private getSQLiteConfig(isDevelopment: boolean): TypeOrmModuleOptions {
    return {
      type: 'better-sqlite3',
      database: this.configService.get('SQLITE_DATABASE_PATH', './pglite_db/database.sqlite'),
      entities,
      synchronize: isDevelopment,
      logging: isDevelopment,
      // Optimizaciones para SQLite
      extra: {
        busyTimeout: 30000,
      },
    };
  }

  shouldUsePGlite(): boolean {
    const databaseMode = this.getDatabaseMode();
    const isProduction = this.configService.get('NODE_ENV') === 'production';
    
    // En modo híbrido:
    // - Desarrollo: usar PGlite para funciones avanzadas
    // - Producción: usar PostgreSQL nativo para funciones avanzadas
    if (databaseMode === 'hybrid') {
      return !isProduction;
    }
    
    // En modo SQLite: siempre usar PGlite
    if (databaseMode === 'sqlite') {
      return true;
    }
    
    // En modo PostgreSQL: nunca usar PGlite
    return false;
  }

  getConnectionInfo(): {
    mode: DatabaseMode;
    typeormDriver: string;
    advancedQueries: string;
    environment: string;
  } {
    const databaseMode = this.getDatabaseMode();
    const environment = this.configService.get('NODE_ENV', 'development');
    const shouldUsePGlite = this.shouldUsePGlite();

    let typeormDriver: string;
    let advancedQueries: string;

    switch (databaseMode) {
      case 'postgres':
        typeormDriver = 'PostgreSQL';
        advancedQueries = 'PostgreSQL Native';
        break;
      case 'hybrid':
        if (environment === 'production') {
          typeormDriver = 'PostgreSQL';
          advancedQueries = 'PostgreSQL Native';
        } else {
          typeormDriver = 'SQLite (better-sqlite3)';
          advancedQueries = 'PGlite';
        }
        break;
      case 'sqlite':
      default:
        typeormDriver = 'SQLite (better-sqlite3)';
        advancedQueries = shouldUsePGlite ? 'PGlite' : 'SQLite';
        break;
    }

    return {
      mode: databaseMode,
      typeormDriver,
      advancedQueries,
      environment,
    };
  }
}
