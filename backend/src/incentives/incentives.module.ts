import { Module } from '@nestjs/common';
import { IncentivesService } from './incentives.service';
import { IncentivesController } from './incentives.controller';

@Module({
  providers: [IncentivesService],
  controllers: [IncentivesController],
  exports: [IncentivesService],
})
export class IncentivesModule {}
