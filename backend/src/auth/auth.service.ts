import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    return {
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async register(dto: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    role?: string;
  }) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    if (dto.password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters');
    }

    const hash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        phone: dto.phone,
        passwordHash: hash,
        role: (dto.role as any) || 'STUDENT',
      },
    });

    // Create student profile if role is STUDENT
    if (user.role === 'STUDENT') {
      await this.prisma.studentProfile.create({ data: { userId: user.id } });
    }

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    return {
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async me(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        studentProfile: true,
      },
    });
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const valid = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Current password is incorrect');
    if (newPassword.length < 8) throw new BadRequestException('Password must be 8+ characters');

    const hash = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({ where: { id: userId }, data: { passwordHash: hash } });
    return { message: 'Password changed successfully' };
  }
  async runMigrations() {
    const results: string[] = [];
    await this.prisma.$executeRawUnsafe(`DO $$ BEGIN CREATE TYPE "CurrencyType" AS ENUM ('INR','USD','EUR','AUD','CNY','SGD'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;`);
    results.push('enum ok');
    await this.prisma.$executeRawUnsafe(`ALTER TABLE "Course" ADD COLUMN IF NOT EXISTS "currencyType" "CurrencyType" NOT NULL DEFAULT 'INR'`);
    results.push('Course.currencyType ok');
    await this.prisma.$executeRawUnsafe(`ALTER TABLE "Course" ADD COLUMN IF NOT EXISTS "country" TEXT`);
    results.push('Course.country ok');
    await this.prisma.$executeRawUnsafe(`ALTER TABLE "College" ADD COLUMN IF NOT EXISTS "currencyType" "CurrencyType" NOT NULL DEFAULT 'INR'`);
    results.push('College.currencyType ok');

    // Migration 0006: incentive payment details
    await this.prisma.$executeRawUnsafe(`ALTER TABLE "IncentiveRecord" ADD COLUMN IF NOT EXISTS "paymentMode" TEXT`);
    await this.prisma.$executeRawUnsafe(`ALTER TABLE "IncentiveRecord" ADD COLUMN IF NOT EXISTS "paymentRef" TEXT`);
    await this.prisma.$executeRawUnsafe(`ALTER TABLE "IncentiveRecord" ADD COLUMN IF NOT EXISTS "paymentRemarks" TEXT`);
    results.push('Migration 0006: payment details ok');

    // Migration 0007: make IncentiveRecord fields optional for manual records
    await this.prisma.$executeRawUnsafe(`ALTER TABLE "IncentiveRecord" ALTER COLUMN "leadId" DROP NOT NULL`);
    await this.prisma.$executeRawUnsafe(`ALTER TABLE "IncentiveRecord" ALTER COLUMN "courseId" DROP NOT NULL`);
    await this.prisma.$executeRawUnsafe(`ALTER TABLE "IncentiveRecord" ALTER COLUMN "feesAtClosure" DROP NOT NULL`);
    await this.prisma.$executeRawUnsafe(`ALTER TABLE "IncentiveRecord" ALTER COLUMN "incentiveSource" DROP NOT NULL`);
    await this.prisma.$executeRawUnsafe(`ALTER TABLE "IncentiveRecord" ADD COLUMN IF NOT EXISTS "incentiveType" TEXT`);
    await this.prisma.$executeRawUnsafe(`ALTER TABLE "Lead" ALTER COLUMN "studentPhone" DROP NOT NULL`);
    // Drop unique constraint if exists, add partial unique index
    await this.prisma.$executeRawUnsafe(`ALTER TABLE "IncentiveRecord" DROP CONSTRAINT IF EXISTS "IncentiveRecord_leadId_key"`);
    await this.prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "IncentiveRecord_leadId_unique" ON "IncentiveRecord"("leadId") WHERE "leadId" IS NOT NULL`);
    results.push('Migration 0007: optional fields ok');

    return results;
  }

  async fixCollegeData() {
    // Map of known international universities that were wrongly assigned "India"
    const knownForeign: Record<string, {country: string, currencyType: string}> = {
      'arizona state': { country: 'United States', currencyType: 'USD' },
      'california': { country: 'United States', currencyType: 'USD' },
      'florida': { country: 'United States', currencyType: 'USD' },
      'texas': { country: 'United States', currencyType: 'USD' },
      'new york': { country: 'United States', currencyType: 'USD' },
      'oxford': { country: 'United Kingdom', currencyType: 'GBP' },
      'cambridge': { country: 'United Kingdom', currencyType: 'GBP' },
      'london': { country: 'United Kingdom', currencyType: 'GBP' },
      'australia': { country: 'Australia', currencyType: 'AUD' },
      'sydney': { country: 'Australia', currencyType: 'AUD' },
      'melbourne': { country: 'Australia', currencyType: 'AUD' },
      'singapore': { country: 'Singapore', currencyType: 'SGD' },
      'nanyang': { country: 'Singapore', currencyType: 'SGD' },
      'china': { country: 'China', currencyType: 'CNY' },
      'beijing': { country: 'China', currencyType: 'CNY' },
      'toronto': { country: 'Canada', currencyType: 'USD' },
      'canada': { country: 'Canada', currencyType: 'USD' },
    };

    const colleges = await this.prisma.college.findMany({ where: { country: 'India' } });
    let fixed = 0;
    for (const college of colleges) {
      const nameLower = college.name.toLowerCase();
      for (const [keyword, data] of Object.entries(knownForeign)) {
        if (nameLower.includes(keyword)) {
          await this.prisma.college.update({
            where: { id: college.id },
            data: { country: data.country, currencyType: data.currencyType as any },
          });
          fixed++;
          break;
        }
      }
    }
    return { fixed, total: colleges.length };
  }

  async updateMe(userId: string, dto: { name?: string; phone?: string }) {
    const data: any = {};
    if (dto.name)  data.name  = dto.name;
    if (dto.phone) data.phone = dto.phone;
    const user = await this.prisma.user.update({ where: { id: userId }, data,
      select: { id:true, name:true, email:true, role:true, phone:true, isActive:true }
    });
    return user;
  }

}