import {
  Injectable,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PGlite } from '@electric-sql/pglite';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PGliteService implements OnApplicationShutdown, OnModuleInit {
  private pgliteInstance: PGlite;
  private initializationPromise: Promise<void>;
  private shouldInitialize: boolean;

  constructor(private configService: ConfigService) {
    // Determinar si debemos inicializar PGlite basado en la configuración
    const databaseMode = this.configService.get('DATABASE_MODE', 'hybrid');
    const isProduction = this.configService.get('NODE_ENV') === 'production';

    // PGlite se usa en:
    // - Modo SQLite: siempre
    // - Modo híbrido: solo en desarrollo
    // - Modo PostgreSQL: nunca
    this.shouldInitialize =
      databaseMode === 'sqlite' ||
      (databaseMode === 'hybrid' && !isProduction);

    console.log(
      `🔄 PGlite Service: ${this.shouldInitialize ? 'Will initialize' : 'Skipped (using PostgreSQL)'}`,
    );
  }

  async onModuleInit() {
    if (!this.shouldInitialize) {
      console.log('⏭️ Skipping PGlite initialization (using PostgreSQL)');
      return;
    }

    this.initializationPromise = this.initializePGlite();
    await this.initializationPromise;
  }

  private async initializePGlite() {
    try {
      console.log('🔄 Initializing PGlite database...');

      // Ensure the pglite directory exists and has correct permissions
      const pgliteDir = './pglite_db/pglite';

      // Create directory if it doesn't exist
      if (!fs.existsSync(pgliteDir)) {
        fs.mkdirSync(pgliteDir, { recursive: true });
        console.log('📁 Created PGlite directory');
      }

      // Check write permissions
      try {
        const testFile = path.join(pgliteDir, 'test-write.tmp');
        fs.writeFileSync(testFile, 'test');
        fs.unlinkSync(testFile);
        console.log('✅ Write permissions verified');
      } catch (permError) {
        console.warn('⚠️ Write permission issue:', permError.message);
        throw new Error('Directory not writable');
      }

      // Try to initialize PGlite with persistent storage
      try {
        this.pgliteInstance = new PGlite(pgliteDir, {
          debug: process.env.NODE_ENV === 'development' ? 1 : 0,
        });

        // Wait for initialization and test the connection
        await this.pgliteInstance.waitReady;
        await this.pgliteInstance.query('SELECT 1');
        console.log('✅ PGlite database initialized with persistent storage');

        // Create basic tables if they don't exist
        await this.initializeBasicSchema();
      } catch (persistentError) {
        console.warn(
          '⚠️ Persistent storage failed, trying in-memory mode:',
          persistentError.message,
        );

        // Clean up any partial files
        try {
          if (fs.existsSync(pgliteDir)) {
            fs.rmSync(pgliteDir, { recursive: true, force: true });
          }
        } catch (cleanupError) {
          console.warn('Failed to cleanup:', cleanupError.message);
        }

        // Fallback to in-memory database
        this.pgliteInstance = new PGlite({
          debug: process.env.NODE_ENV === 'development' ? 1 : 0,
        });

        await this.pgliteInstance.waitReady;
        await this.pgliteInstance.query('SELECT 1');
        console.log('✅ PGlite database initialized in memory mode');

        // Create basic tables in memory too
        await this.initializeBasicSchema();
      }
    } catch (error) {
      console.error('❌ Failed to initialize PGlite database:', error);
      console.warn('⚠️ Continuing without PGlite advanced features');
      this.pgliteInstance = null;
    }
  }

  private async initializeBasicSchema() {
    try {
      // Create a simple test table to verify PGlite is working
      await this.pgliteInstance.exec(`
        CREATE TABLE IF NOT EXISTS pglite_test (
          id SERIAL PRIMARY KEY,
          name TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      // Insert a test record
      await this.pgliteInstance.query(
        'INSERT INTO pglite_test (name) VALUES ($1) ON CONFLICT DO NOTHING',
        ['PGlite initialized successfully'],
      );
      
      console.log('✅ PGlite basic schema initialized');
    } catch (schemaError) {
      console.warn('⚠️ Schema initialization failed:', schemaError.message);
    }
  }

  async onApplicationShutdown() {
    if (this.pgliteInstance) {
      await this.pgliteInstance.close();
      console.log('🔴 PGlite database connection closed');
    }
  }

  async getPGliteInstance(): Promise<PGlite> {
    if (!this.shouldInitialize) {
      throw new Error(
        'PGlite not available - application is configured to use PostgreSQL directly',
      );
    }

    await this.ensureInitialized();
    if (!this.pgliteInstance) {
      throw new Error(
        'PGlite instance not initialized - using SQLite fallback',
      );
    }
    return this.pgliteInstance;
  }

  private async ensureInitialized(): Promise<void> {
    if (this.initializationPromise) {
      await this.initializationPromise;
    }
  }

  async query(sql: string, params?: any[]): Promise<any> {
    if (!this.shouldInitialize) {
      throw new Error(
        'PGlite not available - use native PostgreSQL connection for advanced queries',
      );
    }

    await this.ensureInitialized();
    if (!this.pgliteInstance) {
      throw new Error(
        'PGlite not available - use TypeORM for database operations',
      );
    }
    return await this.pgliteInstance.query(sql, params);
  }

  async execute(sql: string): Promise<any> {
    if (!this.shouldInitialize) {
      throw new Error(
        'PGlite not available - use native PostgreSQL connection for advanced queries',
      );
    }

    await this.ensureInitialized();
    if (!this.pgliteInstance) {
      throw new Error(
        'PGlite not available - use TypeORM for database operations',
      );
    }
    return await this.pgliteInstance.exec(sql);
  }

  async getStatus(): Promise<{
    isInitialized: boolean;
    mode: 'persistent' | 'memory' | 'unavailable' | 'postgres';
    testQuery: boolean;
  }> {
    if (!this.shouldInitialize) {
      return {
        isInitialized: false,
        mode: 'postgres',
        testQuery: false,
      };
    }

    if (!this.pgliteInstance) {
      return {
        isInitialized: false,
        mode: 'unavailable',
        testQuery: false,
      };
    }

    try {
      await this.pgliteInstance.query('SELECT 1');
      const hasPersistentStorage = fs.existsSync('./pglite_db/pglite');

      return {
        isInitialized: true,
        mode: hasPersistentStorage ? 'persistent' : 'memory',
        testQuery: true,
      };
    } catch (error) {
      return {
        isInitialized: true,
        mode: 'memory',
        testQuery: false,
      };
    }
  }
}
