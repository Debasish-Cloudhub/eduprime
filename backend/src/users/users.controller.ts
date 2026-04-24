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

  @Post('seed-admin')
  async seedAdmin() {
    const bcrypt = require('bcryptjs');
    const accounts = [
      { email: 'admin@iscc.in',   name: 'ISCC Admin',      role: 'ADMIN',       pw: 'ISCC@Admin2025!'   },
      { email: 'sales@iscc.in',   name: 'Sales Counselor', role: 'SALES_AGENT', pw: 'ISCC@Sales2025!'   },
      { email: 'finance@iscc.in', name: 'Finance Manager',  role: 'FINANCE',     pw: 'ISCC@Finance2025!' },
      { email: 'student@iscc.in', name: 'Demo Student',     role: 'STUDENT',     pw: 'ISCC@Student2025!' },
    ];

    const results = [];
    for (const acc of accounts) {
      const hash = await bcrypt.hash(acc.pw, 12);
      try {
        await this.usersService['prisma'].user.upsert({
          where: { email: acc.email },
          update: { name: acc.name, role: acc.role as any, passwordHash: hash, isActive: true },
          create: { email: acc.email, name: acc.name, role: acc.role as any, passwordHash: hash, isActive: true }
        });
        results.push({ email: acc.email, role: acc.role, status: 'seeded' });
      } catch(e: any) {
        results.push({ email: acc.email, error: e.message });
      }
    }
    return { message: 'ISCC accounts seeded!', accounts: results };
  }

}