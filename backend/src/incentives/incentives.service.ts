import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class IncentivesService {
  constructor(private prisma: PrismaService) {}

  /**
   * INCENTIVE LOGIC:
   * 1. incentive = NULL initially
   * 2. On College + Course selection:
   *    - Fetch fees from DB (Excel source)
   *    - Use Excel fixed incentive if set
   *    - Else use % of fees (from SystemConfig or course.incentivePct)
   * 3. On WON: lock incentive permanently
   */

  async calculatePreview(courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: { college: { select: { id: true, name: true } } },
    });
    if (!course) throw new NotFoundException('Course not found');

    const fees = Number(course.fees);
    let incentiveAmount: number;
    let incentiveSource: string;
    let incentivePctUsed: number | null = null;

    if (course.incentiveFixed && Number(course.incentiveFixed) > 0) {
      // Excel-defined fixed incentive
      incentiveAmount = Number(course.incentiveFixed);
      incentiveSource = 'EXCEL_FIXED';
    } else {
      // Fallback: % of fees
      const pct = await this.getDefaultIncentivePct(course.incentivePct);
      incentiveAmount = (fees * pct) / 100;
      incentiveSource = 'PERCENTAGE_OF_FEES';
      incentivePctUsed = pct;
    }

    return {
      courseId,
      courseName: course.name,
      college: course.college,
      fees,
      incentiveAmount: Math.round(incentiveAmount * 100) / 100,
      incentiveSource,
      incentivePctUsed,
      currency: 'INR',
    };
  }

  async lockIncentive(leadId: string, courseId: string, agentId: string) {
    // Check if already locked
    const existing = await this.prisma.incentiveRecord.findUnique({
      where: { leadId },
    });
    if (existing?.isLocked) return existing;

    const preview = await this.calculatePreview(courseId);

    const record = await this.prisma.incentiveRecord.upsert({
      where: { leadId },
      update: {
        feesAtClosure: preview.fees,
        incentiveAmount: preview.incentiveAmount,
        incentiveSource: preview.incentiveSource as any,
        incentivePctUsed: preview.incentivePctUsed,
        isLocked: true,
        lockedAt: new Date(),
      },
      create: {
        leadId,
        agentId,
        courseId,
        feesAtClosure: preview.fees,
        incentiveAmount: preview.incentiveAmount,
        incentiveSource: preview.incentiveSource as any,
        incentivePctUsed: preview.incentivePctUsed,
        isLocked: true,
        lockedAt: new Date(),
      },
    });

    return {
      feesAtClosure: preview.fees,
      incentiveAmount: preview.incentiveAmount,
      incentiveSource: preview.incentiveSource,
    };
  }

  async getAgentIncentives(
    agentId: string,
    month?: number,
    year?: number,
  ) {
    const where: any = { agentId };
    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);
      where.createdAt = { gte: start, lte: end };
    }

    const records = await this.prisma.incentiveRecord.findMany({
      where,
      include: {
        lead: {
          select: {
            id: true,
            studentName: true,
            status: true,
            wonAt: true,
          },
        },
        course: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const total = records.reduce(
      (sum, r) => sum + Number(r.incentiveAmount),
      0,
    );
    const locked = records.filter((r) => r.isLocked);
    const paid = records.filter((r) => r.paidAt !== null);

    return {
      records,
      summary: {
        total: Math.round(total * 100) / 100,
        totalLocked: locked.reduce((s, r) => s + Number(r.incentiveAmount), 0),
        totalPaid: paid.reduce((s, r) => s + Number(r.incentiveAmount), 0),
        count: records.length,
      },
    };
  }

  async getAllIncentives(filters: {
    page?: number;
    limit?: number;
    agentId?: string;
    isLocked?: boolean;
    isPaid?: boolean;
    month?: number;
    year?: number;
  }) {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters.agentId) where.agentId = filters.agentId;
    if (filters.isLocked !== undefined) where.isLocked = filters.isLocked;
    if (filters.isPaid !== undefined)
      where.paidAt = filters.isPaid ? { not: null } : null;

    const [total, records] = await Promise.all([
      this.prisma.incentiveRecord.count({ where }),
      this.prisma.incentiveRecord.findMany({
        where,
        skip,
        take: limit,
        include: {
          agent: { select: { id: true, name: true, email: true } },
          lead: { select: { id: true, studentName: true, status: true } },
          course: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      data: records,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async markPaid(id: string, details?: { paymentMode?: string; paymentRef?: string; paymentRemarks?: string }) {
    return this.prisma.incentiveRecord.update({
      where: { id },
      data: { paidAt: new Date(), paymentMode: details?.paymentMode, paymentRef: details?.paymentRef, paymentRemarks: details?.paymentRemarks },
    });
  }

  async updateConfig(key: string, value: string) {
    return this.prisma.systemConfig.upsert({
      where: { key },
      update: { value },
      create: { key, value, description: `Incentive config: ${key}` },
    });
  }

  private async getDefaultIncentivePct(coursePct: any): Promise<number> {
    if (coursePct && Number(coursePct) > 0) return Number(coursePct);
    // Fallback to system config
    const config = await this.prisma.systemConfig.findUnique({
      where: { key: 'DEFAULT_INCENTIVE_PCT' },
    });
    return config ? parseFloat(config.value) : 5; // default 5%
  }
}
