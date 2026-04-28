import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

process.on('uncaughtException', (err: Error) => { console.error('[uncaughtException]', err?.stack ?? err); process.exit(1); });
process.on('unhandledRejection', (reason: unknown) => { console.error('[unhandledRejection]', reason); process.exit(1); });

async function bootstrap() {
  console.log('[bootstrap] Starting ISCC Digital API...');
  const app = await NestFactory.create(AppModule, { logger: ['log','warn','error'] });

  app.setGlobalPrefix('api/v1');

  // Open CORS - allow all origins (frontend proxies requests server-side anyway)
  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));

  const port = process.env.PORT || 4000;
  await app.listen(port, '0.0.0.0');
  console.log(`[bootstrap] ISCC Digital API running on port ${port}`);
}

bootstrap();
