import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';

process.on('uncaughtException', (err: Error) => { console.error('[uncaughtException]', err?.stack ?? err); process.exit(1); });
process.on('unhandledRejection', (reason: unknown) => { console.error('[unhandledRejection]', reason); process.exit(1); });

async function seedAccounts(prisma: PrismaService) {
  const bcrypt = require('bcryptjs');
  const accounts = [
    { email: 'admin@digitalstudy.me',   name: 'ISCC Admin',      role: 'ADMIN',       pw: 'ISCC@Admin2025!'   },
    { email: 'sales@digitalstudy.me',   name: 'Sales Counselor', role: 'SALES_AGENT', pw: 'ISCC@Sales2025!'   },
    { email: 'finance@digitalstudy.me', name: 'Finance Manager',  role: 'FINANCE',     pw: 'ISCC@Finance2025!' },
    { email: 'student@digitalstudy.me', name: 'Demo Student',     role: 'STUDENT',     pw: 'ISCC@Student2025!' },
  ];
  for (const acc of accounts) {
    const hash = await bcrypt.hash(acc.pw, 12);
    await prisma.user.upsert({
      where: { email: acc.email },
      update: { name: acc.name, role: acc.role as any, passwordHash: hash, isActive: true },
      create: { email: acc.email, name: acc.name, role: acc.role as any, passwordHash: hash, isActive: true },
    });
    console.log(`[seed] ✅ ${acc.email} ready`);
  }
}

async function bootstrap() {
  console.log('[bootstrap] Starting ISCC Digital API...');
  const app = await NestFactory.create(AppModule, { logger: ['log','warn','error'] });

  app.setGlobalPrefix('api/v1');

  // Allow all Railway + localhost origins
  app.enableCors({
    origin: (origin: string | undefined, cb: Function) => cb(null, true),
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));

  const port = process.env.PORT || 4000;
  await app.listen(port, '0.0.0.0');
  console.log(`[bootstrap] 🚀 ISCC Digital API running on port ${port}`);

  // Auto-seed accounts on every startup
  try {
    const prisma = app.get(PrismaService);
    await seedAccounts(prisma);
    console.log('[bootstrap] ✅ ISCC accounts seeded successfully');
  } catch (e: any) {
    console.error('[bootstrap] Seed warning:', e.message);
  }
}

bootstrap();
