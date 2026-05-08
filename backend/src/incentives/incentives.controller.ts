import {
  Controller, Get, Post, Patch, Param, Query, Body, UseGuards, Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { IncentivesService } from './incentives.service';

@ApiTags('incentives')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('incentives')
export class IncentivesController {
  constructor(private incentivesService: IncentivesService) {}

  @Get('preview/:courseId')
  @Roles('ADMIN', 'SALES_AGENT')
  @ApiOperation({ summary: 'Preview incentive for a course' })
  preview(@Param('courseId') courseId: string) {
    return this.incentivesService.calculatePreview(courseId);
  }

  @Get('my')
  @Roles('SALES_AGENT', 'ADMIN')
  @ApiOperation({ summary: 'Get my incentive records' })
  myIncentives(
    @Request() req: any,
    @Query('month') month?: string,
    @Query('year') year?: string,
  ) {
    return this.incentivesService.getAgentIncentives(
      req.user.id,
      month ? parseInt(month) : undefined,
      year ? parseInt(year) : undefined,
    );
  }

  @Get()
  @Roles('ADMIN', 'FINANCE')
  @ApiOperation({ summary: 'Get all incentive records (Admin/Finance)' })
  getAll(@Query() filters: any) {
    return this.incentivesService.getAllIncentives(filters);
  }

  @Patch(':id/mark-paid')
  @Roles('ADMIN', 'FINANCE')
  @ApiOperation({ summary: 'Mark incentive as paid' })
  markPaid(@Param('id') id: string, @Body() dto: any) {
    return this.incentivesService.markPaid(id, dto);
  }

  @Post('config')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update incentive config (e.g. DEFAULT_INCENTIVE_PCT)' })
  updateConfig(@Body('key') key: string, @Body('value') value: string) {
    return this.incentivesService.updateConfig(key, value);
  }
}
