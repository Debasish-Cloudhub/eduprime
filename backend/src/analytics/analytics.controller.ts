import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { AnalyticsService } from './analytics.service';

@ApiTags('analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @Roles('ADMIN', 'SALES_AGENT', 'FINANCE')
  @ApiOperation({ summary: 'Get dashboard KPIs' })
  dashboard(@Request() req: any) {
    return this.analyticsService.getDashboard(req.user.role, req.user.id);
  }

  @Get('funnel')
  @Roles('ADMIN', 'SALES_AGENT', 'FINANCE')
  @ApiOperation({ summary: 'Lead funnel by status' })
  funnel(@Request() req: any, @Query('agentId') agentId?: string) {
    const id = req.user.role === 'SALES_AGENT' ? req.user.id : agentId;
    return this.analyticsService.getFunnel(id);
  }

  @Get('conversion-by-source')
  @Roles('ADMIN', 'FINANCE')
  @ApiOperation({ summary: 'Conversion rate by lead source' })
  conversionBySource() {
    return this.analyticsService.getConversionBySource();
  }

  @Get('revenue-vs-expense')
  @Roles('ADMIN', 'FINANCE')
  @ApiOperation({ summary: 'Monthly incentives vs expenses for a year' })
  revenueVsExpense(@Query('year') year?: string) {
    return this.analyticsService.getRevenueVsExpense(parseInt(year || '') || new Date().getFullYear());
  }

  @Get('leaderboard')
  @Roles('ADMIN', 'FINANCE')
  @ApiOperation({ summary: 'Agent leaderboard by conversions' })
  leaderboard(@Query('month') month?: string, @Query('year') year?: string) {
    return this.analyticsService.getAgentLeaderboard(
      month ? parseInt(month) : undefined,
      year ? parseInt(year) : undefined,
    );
  }

  @Get('lead-trend')
  @Roles('ADMIN', 'SALES_AGENT', 'FINANCE')
  @ApiOperation({ summary: 'Lead creation trend over N days' })
  leadTrend(@Request() req: any, @Query('days') days?: string, @Query('agentId') agentId?: string) {
    const id = req.user.role === 'SALES_AGENT' ? req.user.id : agentId;
    return this.analyticsService.getLeadTrend(parseInt(days || '30'), id);
  }
}
