import { Controller, Get, Post, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { SlaService } from './sla.service';

@ApiTags('sla')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('sla')
export class SlaController {
  constructor(private slaService: SlaService) {}

  @Get('summary')
  @Roles('ADMIN', 'FINANCE')
  @ApiOperation({ summary: 'Get SLA summary counts' })
  getSummary() {
    return this.slaService.getSummary();
  }

  @Get('breached')
  @Roles('ADMIN', 'SALES_AGENT')
  @ApiOperation({ summary: 'Get all breached leads' })
  getBreached(@Request() req: any, @Query('agentId') agentId?: string) {
    const id = req.user.role === 'SALES_AGENT' ? req.user.id : agentId;
    return this.slaService.getBreachedLeads(id);
  }

  @Post('check')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Manually trigger SLA check' })
  triggerCheck() {
    return this.slaService.checkSlaBreaches();
  }
}
