import { Controller, Post, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { SulekhaService } from './sulekha.service';

@ApiTags('sulekha')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('sulekha')
export class SulekhaController {
  constructor(private sulekhaService: SulekhaService) {}

  @Post('sync')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Manually trigger Sulekha lead sync' })
  manualSync() {
    return this.sulekhaService.sync('MANUAL');
  }

  @Get('logs')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get Sulekha sync history' })
  getLogs(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.sulekhaService.getSyncLogs(parseInt(page || '1'), parseInt(limit || '20'));
  }
}
