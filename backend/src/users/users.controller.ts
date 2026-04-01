import { Controller, Get, Post, Put, Patch, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'List all users' })
  findAll(@Query() query: any) { return this.usersService.findAll(query); }

  @Get('agents')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'List all active sales agents' })
  getAgents() { return this.usersService.getAgents(); }

  @Get(':id')
  @Roles('ADMIN')
  findOne(@Param('id') id: string) { return this.usersService.findOne(id); }

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create user (Admin only)' })
  create(@Body() dto: any) { return this.usersService.create(dto); }

  @Put(':id')
  @Roles('ADMIN')
  update(@Param('id') id: string, @Body() dto: any) { return this.usersService.update(id, dto); }

  @Patch(':id/toggle-active')
  @Roles('ADMIN')
  toggleActive(@Param('id') id: string) { return this.usersService.toggleActive(id); }

  @Patch(':id/reset-password')
  @Roles('ADMIN')
  resetPassword(@Param('id') id: string, @Body('password') password: string) {
    return this.usersService.resetPassword(id, password);
  }
}
