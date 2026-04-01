import { Module } from '@nestjs/common';
import { SulekhaService } from './sulekha.service';
import { SulekhaController } from './sulekha.controller';

@Module({
  providers: [SulekhaService],
  controllers: [SulekhaController],
  exports: [SulekhaService],
})
export class SulekhaModule {}
