import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }

  async onModuleInit() {
    console.log('[PrismaService] onModuleInit — beginning database connection sequence');
    console.log(`[PrismaService] Will attempt up to ${MAX_RETRIES} connections (${RETRY_DELAY_MS}ms between retries)`);

    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      console.error('[PrismaService] DATABASE_URL environment variable is not set — connection will fail');
    } else {
      // Log a redacted URL so we can confirm the host/db without exposing credentials
      try {
        const redacted = new URL(dbUrl);
        redacted.password = '***';
        console.log(`[PrismaService] DATABASE_URL host: ${redacted.host}, pathname: ${redacted.pathname}`);
      } catch {
        console.error('[PrismaService] DATABASE_URL is set but could not be parsed as a URL');
      }
    }

    let lastError: unknown;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      console.log(`[PrismaService] Connection attempt ${attempt}/${MAX_RETRIES}...`);
      try {
        await this.$connect();
        this.logger.log('Database connection established successfully');
        console.log(`[PrismaService] ✅ Database connected on attempt ${attempt}/${MAX_RETRIES}`);
        return;
      } catch (err) {
        lastError = err;
        const message = err instanceof Error ? err.message : String(err);
        this.logger.error(
          `Database connection attempt ${attempt}/${MAX_RETRIES} failed: ${message}`,
          err instanceof Error ? err.stack : undefined,
        );
        console.error(`[PrismaService] ❌ Attempt ${attempt}/${MAX_RETRIES} failed: ${message}`);
        if (err instanceof Error && err.stack) {
          console.error(`[PrismaService] Stack: ${err.stack}`);
        }

        if (attempt < MAX_RETRIES) {
          this.logger.warn(`Retrying in ${RETRY_DELAY_MS / 1000}s...`);
          console.log(`[PrismaService] Waiting ${RETRY_DELAY_MS}ms before next attempt...`);
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
        }
      }
    }

    // All retries exhausted — log the final error but do not rethrow.
    // The application will continue to start so that the healthcheck endpoint
    // remains reachable and deployment logs surface the real failure reason.
    const message = lastError instanceof Error ? lastError.message : String(lastError);
    this.logger.error(
      `All ${MAX_RETRIES} database connection attempts failed. ` +
        `The application will start in a degraded state. Last error: ${message}`,
      lastError instanceof Error ? lastError.stack : undefined,
    );
    console.error(
      `[PrismaService] ❌ All ${MAX_RETRIES} connection attempts exhausted. ` +
        `Application starting in degraded state. Last error: ${message}`,
    );
    if (lastError instanceof Error && lastError.stack) {
      console.error(`[PrismaService] Final error stack: ${lastError.stack}`);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
