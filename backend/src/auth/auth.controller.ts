import { Controller, Post, Get, Body, UseGuards, Request, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

export class ChangePasswordDto {
  @IsString()
  oldPassword: string;

  @IsString()
  @MinLength(8)
  newPassword: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login with email + password' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new student account' })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  me(@Request() req: any) {
    return this.authService.me(req.user.id);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  changePassword(@Request() req: any, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(req.user.id, dto.oldPassword, dto.newPassword);
  }

  @Post('setup-iscc')
  @HttpCode(200)
  async setupISCC() {
    const bcrypt = require('bcryptjs');
    const prisma = this.authService['prisma'];
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
        await prisma.user.upsert({
          where: { email: acc.email },
          update: { name: acc.name, role: acc.role as any, passwordHash: hash, isActive: true },
          create: { email: acc.email, name: acc.name, role: acc.role as any, passwordHash: hash, isActive: true }
        });
        results.push({ email: acc.email, status: 'ok' });
      } catch(e: any) { results.push({ email: acc.email, error: e.message }); }
    }
    return { message: 'ISCC setup complete', accounts: results };
  }
}