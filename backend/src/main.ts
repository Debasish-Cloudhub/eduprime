import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

// Catch any exception that escapes all async error handling
process.on('uncaughtException', (err: Error) => {
  console.error('[uncaughtException] Unhandled exception — process will exit');
  console.error(err?.stack ?? err);
  process.exit(1);
});

// Catch any unhandled promise rejection
process.on('unhandledRejection', (reason: unknown) => {
  console.error('[unhandledRejection] Unhandled promise rejection — process will exit');
  if (reason instanceof Error) {
    console.error(reason.stack ?? reason);
  } else {
    console.error(reason);
  }
  process.exit(1);
});

async function bootstrap() {
  try {
    console.log('[bootstrap] Starting EduPrime API...');
    console.log(`[bootstrap] NODE_ENV=${process.env.NODE_ENV ?? '(not set)'}`);
    console.log(`[bootstrap] PORT=${process.env.PORT ?? '(not set, will default to 4000)'}`);

    console.log('[bootstrap] Creating NestJS application...');
    const app = await NestFactory.create(AppModule, {
      logger: ['log', 'warn', 'error', 'debug', 'verbose'],
    });
    console.log('[bootstrap] NestJS application created successfully');

    // Global prefix
    app.setGlobalPrefix('api/v1');
    console.log('[bootstrap] Global prefix set: api/v1');

    // CORS
    app.enableCors({
      origin: process.env.CORS_ORIGINS?.split(',') || [
        'http://localhost:3000',
        'http://localhost:3001',
        'https://student.eduprime.in',
        'https://sales.eduprime.in',
        'https://admin.eduprime.in',
        'https://expenses.eduprime.in',
      ],
      credentials: true,
    });
    console.log('[bootstrap] CORS configured');

    // Global validation
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    console.log('[bootstrap] Global ValidationPipe configured');

    // Swagger docs
    if (process.env.NODE_ENV !== 'production') {
      console.log('[bootstrap] Setting up Swagger (non-production)...');
      const config = new DocumentBuilder()
        .setTitle('EduPrime API')
        .setDescription('B2C Education Consulting Platform API')
        .setVersion('1.0')
        .addBearerAuth()
        .addTag('auth', 'Authentication')
        .addTag('leads', 'CRM Lead Management')
        .addTag('courses', 'Course & College Data')
        .addTag('incentives', 'Incentive Engine')
        .addTag('expenses', 'Expense Management')
        .addTag('analytics', 'Analytics & Reports')
        .addTag('excel', 'Excel Upload')
        .addTag('sulekha', 'Sulekha Integration')
        .build();

      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('api/docs', app, document, {
        swaggerOptions: { persistAuthorization: true },
      });
      console.log('[bootstrap] Swagger configured');
    }

    const port = process.env.PORT || 4000;
    console.log(`[bootstrap] Starting HTTP listener on 0.0.0.0:${port}...`);
    await app.listen(port, '0.0.0.0');
    console.log(`[bootstrap] 🚀 EduPrime API running on port ${port}`);
    console.log(`[bootstrap] 📚 Swagger docs: http://localhost:${port}/api/docs`);
  } catch (err: unknown) {
    console.error('[bootstrap] FATAL: Bootstrap failed with an unhandled error');
    if (err instanceof Error) {
      console.error(`[bootstrap] Error name   : ${err.name}`);
      console.error(`[bootstrap] Error message: ${err.message}`);
      console.error('[bootstrap] Stack trace:');
      console.error(err.stack);
    } else {
      console.error('[bootstrap] Non-Error value thrown:', err);
    }
    process.exit(1);
  }
}

bootstrap();
