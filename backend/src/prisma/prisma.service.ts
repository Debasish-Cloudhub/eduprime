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
    let lastError: unknown;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        await this.$connect();
        this.logger.log('Database connection established successfully');
        return;
      } catch (err) {
        lastError = err;
        const message = err instanceof Error ? err.message : String(err);
        this.logger.error(
          `Database connection attempt ${attempt}/${MAX_RETRIES} failed: ${message}`,
          err instanceof Error ? err.stack : undefined,
        );

        if (attempt < MAX_RETRIES) {
          this.logger.warn(`Retrying in ${RETRY_DELAY_MS / 1000}s...`);
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
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
