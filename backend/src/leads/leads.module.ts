import { Module } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { LeadsController } from './leads.controller';
import { IncentivesModule } from '../incentives/incentives.module';
import { SlaModule } from '../sla/sla.module';

@Module({
  imports: [IncentivesModule, SlaModule],
  providers: [LeadsService],
  controllers: [LeadsController],
  exports: [LeadsService],
})
export class LeadsModule {}
