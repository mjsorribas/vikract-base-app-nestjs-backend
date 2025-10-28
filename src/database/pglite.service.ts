import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { PGlite } from '@electric-sql/pglite';

@Injectable()
export class PGliteService implements OnApplicationShutdown {
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

  async onApplicationShutdown() {
    if (this.pgliteInstance) {
      await this.pgliteInstance.close();
      console.log('🔴 PGlite database connection closed');
    }
  }

  getPGliteInstance(): PGlite {
    if (!this.pgliteInstance) {
      throw new Error('PGlite instance not initialized');
    }
    return this.pgliteInstance;
  }

  async query(sql: string, params?: any[]): Promise<any> {
    return await this.pgliteInstance.query(sql, params);
  }

  async execute(sql: string): Promise<any> {
    return await this.pgliteInstance.exec(sql);
  }
}