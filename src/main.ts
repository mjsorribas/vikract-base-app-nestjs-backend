import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);

    // Enable validation globally
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    // Enable CORS
    app.enableCors({
      origin: process.env.FRONTEND_URL || 'http://localhost:3001',
      credentials: true,
    });

    // Set global prefix
    app.setGlobalPrefix('api');

    // Simple health endpoint
    const expressApp = app.getHttpAdapter().getInstance();
    expressApp.get('/api', (req, res) => {
      res.json({
        message: 'Vikract NestJS Backend API',
        version: '0.0.1',
        status: 'OK',
        timestamp: new Date().toISOString(),
        authentication: 'JWT + API Keys',
      });
    });

    const port = process.env.PORT || 3000;
    await app.listen(port);

    console.log(`🚀 Application is running on: http://localhost:${port}/api`);
    console.log(`🔐 JWT Authentication enabled`);
    console.log(`📖 Blog Backend with PGlite database initialized`);
  } catch (error) {
    console.error('❌ Error starting application:', error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process in development
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

bootstrap();
