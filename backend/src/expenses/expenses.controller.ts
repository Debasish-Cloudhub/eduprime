import {
  Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards, Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { ExpensesService } from './expenses.service';

@ApiTags('expenses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('expenses')
export class ExpensesController {
  constructor(private expensesService: ExpensesService) {}

  @Post()
  @Roles('SALES_AGENT', 'ADMIN')
  @ApiOperation({ summary: 'Log an expense' })
  create(@Body() dto: any, @Request() req: any) {
    return this.expensesService.create(dto, req.user.id);
  }

  @Get()
  @Roles('ADMIN', 'FINANCE', 'SALES_AGENT')
  @ApiOperation({ summary: 'List expenses' })
  findAll(@Query() query: any, @Request() req: any) {
    if (req.user.role === 'SALES_AGENT') query.agentId = req.user.id;
    return this.expensesService.findAll(query);
  }

  @Get('monthly-summary')
  @Roles('ADMIN', 'FINANCE')
  @ApiOperation({ summary: 'Monthly expense summary for a year' })
  monthlySummary(@Query('year') year: string) {
    return this.expensesService.getMonthlySummary(parseInt(year) || new Date().getFullYear());
  }

  @Get('my-summary')
  @Roles('SALES_AGENT', 'ADMIN')
  @ApiOperation({ summary: 'Get my expense summary for a month' })
  mySummary(
    @Request() req: any,
    @Query('month') month: string,
    @Query('year') year: string,
  ) {
    return this.expensesService.getAgentSummary(
      req.user.id,
      parseInt(month) || new Date().getMonth() + 1,
      parseInt(year) || new Date().getFullYear(),
    );
  }

  @Get(':id')
  @Roles('ADMIN', 'FINANCE', 'SALES_AGENT')
  findOne(@Param('id') id: string) {
    return this.expensesService.findOne(id);
  }

  @Patch(':id/approve')
  @Roles('ADMIN', 'FINANCE')
  @ApiOperation({ summary: 'Approve an expense' })
  approve(@Param('id') id: string, @Request() req: any) {
    return this.expensesService.approve(id, req.user.id);
  }

  @Patch(':id/reject')
  @Roles('ADMIN', 'FINANCE')
  @ApiOperation({ summary: 'Reject an expense' })
  reject(@Param('id') id: string, @Body('reason') reason: string, @Request() req: any) {
    return this.expensesService.reject(id, req.user.id, reason);
  }

  @Delete(':id')
  @Roles('ADMIN', 'SALES_AGENT')
  delete(@Param('id') id: string, @Request() req: any) {
    return this.expensesService.delete(id, req.user.id, req.user.role);
  }
}
