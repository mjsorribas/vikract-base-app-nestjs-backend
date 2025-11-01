import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { SeedService } from './seed.service';
import { PGliteService } from './pglite.service';
import { DatabaseConfigService } from './database-config.service';
import { RolesModule } from '../roles/roles.module';
import { LanguagesModule } from '../languages/languages.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const databaseMode = configService.get('DATABASE_MODE', 'hybrid');
        const isProduction = configService.get('NODE_ENV') === 'production';
        
        console.log('🗄️ Database Configuration:');
        console.log(`   Mode: ${databaseMode}`);
        console.log(
          `   Environment: ${isProduction ? 'production' : 'development'}`,
        );

        // Determinar configuración basada en modo y entorno
        if (
          databaseMode === 'postgres' ||
          (databaseMode === 'hybrid' && isProduction)
        ) {
          // Usar PostgreSQL
          console.log(`   TypeORM Driver: PostgreSQL`);
          console.log(`   Advanced Queries: PostgreSQL Native`);
          
          return {
            type: 'postgres',
            host: configService.get('DATABASE_HOST', 'localhost'),
            port: configService.get('DATABASE_PORT', 5432),
            username: configService.get('DATABASE_USERNAME', 'postgres'),
            password: configService.get('DATABASE_PASSWORD', ''),
            database: configService.get('DATABASE_NAME', 'vikract'),
            entities: [__dirname + '/../**/*.entity{.ts,.js}'],
            synchronize: !isProduction,
            logging: !isProduction,
            ssl: isProduction ? { rejectUnauthorized: false } : false,
          };
        } else {
          // Usar SQLite (desarrollo o modo sqlite)
          console.log(`   TypeORM Driver: SQLite (better-sqlite3)`);
          console.log(
            `   Advanced Queries: ${databaseMode === 'sqlite' ? 'PGlite' : 'PGlite (dev only)'}`,
          );

          return {
            type: 'better-sqlite3',
            database: configService.get(
              'SQLITE_DATABASE_PATH',
              './pglite_db/database.sqlite',
            ),
            entities: [__dirname + '/../**/*.entity{.ts,.js}'],
            synchronize: true,
            logging: !isProduction,
          };
        }
      },
      inject: [ConfigService],
    }),
    RolesModule,
    LanguagesModule,
    UsersModule,
  ],
  providers: [SeedService, PGliteService, DatabaseConfigService],
  exports: [PGliteService, DatabaseConfigService],
})
export class DatabaseModule {}
