import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { LeadsService } from './leads.service';

@ApiTags('leads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('leads')
export class LeadsController {
  constructor(private leadsService: LeadsService) {}

  @Post()
  @Roles('ADMIN', 'SALES_AGENT')
  @ApiOperation({ summary: 'Create a new lead' })
  create(@Body() dto: any, @Request() req: any) {
    return this.leadsService.create(dto, req.user.id);
  }

  @Get()
  @Roles('ADMIN', 'SALES_AGENT', 'FINANCE')
  @ApiOperation({ summary: 'Get all leads with filters' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'agentId', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'slaStatus', required: false })
  findAll(@Query() query: any, @Request() req: any) {
    // Sales agents see only their leads
    if (req.user.role === 'SALES_AGENT') {
      query.agentId = req.user.id;
    }
    return this.leadsService.findAll(query);
  }

  @Get('board')
  @Roles('ADMIN', 'SALES_AGENT')
  @ApiOperation({ summary: 'Get Kanban board view' })
  board(@Request() req: any) {
    const agentId = req.user.role === 'SALES_AGENT' ? req.user.id : undefined;
    return this.leadsService.getBoardView(agentId);
  }

  @Get(':id')
  @Roles('ADMIN', 'SALES_AGENT', 'FINANCE')
  @ApiOperation({ summary: 'Get single lead' })
  findOne(@Param('id') id: string) {
    return this.leadsService.findOne(id);
  }

  @Put(':id')
  @Roles('ADMIN', 'SALES_AGENT')
  @ApiOperation({ summary: 'Update lead details' })
  update(@Param('id') id: string, @Body() dto: any, @Request() req: any) {
    return this.leadsService.update(id, dto, req.user.id);
  }

  @Patch(':id/transition')
  @Roles('ADMIN', 'SALES_AGENT')
  @ApiOperation({ summary: 'Transition lead status (with WON incentive lock)' })
  transition(@Param('id') id: string, @Body() dto: any, @Request() req: any) {
    return this.leadsService.transition(id, dto, req.user);
  }

  @Patch(':id/assign')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Assign lead to agent' })
  assign(
    @Param('id') id: string,
    @Body('agentId') agentId: string,
    @Request() req: any,
  ) {
    return this.leadsService.assign(id, agentId, req.user.id);
  }

  @Post(':id/notes')
  @Roles('ADMIN', 'SALES_AGENT')
  @ApiOperation({ summary: 'Add a note to lead' })
  addNote(
    @Param('id') id: string,
    @Body('note') note: string,
    @Request() req: any,
  ) {
    return this.leadsService.addNote(id, note, req.user.id);
  }

  @Get(':id/activities')
  @Roles('ADMIN', 'SALES_AGENT')
  @ApiOperation({ summary: 'Get lead activity log' })
  getActivities(@Param('id') id: string) {
    return this.leadsService.getActivities(id);
  }

  @Get(':id/incentive-preview')
  @Roles('ADMIN', 'SALES_AGENT')
  @ApiOperation({ summary: 'Preview incentive for current lead course' })
  incentivePreview(@Param('id') id: string) {
    return this.leadsService.getIncentivePreview(id);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Delete a lead (Admin only)' })
  delete(@Param('id') id: string) {
    return this.leadsService.delete(id);
  }
}
