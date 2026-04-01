import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import * as dayjs from 'dayjs';

@Injectable()
export class SlaService {
  private readonly logger = new Logger(SlaService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * SLA Rules:
   * - INITIATED → 7 days
   * - IN_PROGRESS → 15 days
   * - DOCS_SUBMITTED → 10 days
   * - OFFER_RECEIVED → 5 days
   */

  // Run every hour: check SLA breaches
  @Cron(CronExpression.EVERY_HOUR)
  async checkSlaBreaches() {
    this.logger.log('Running SLA breach check...');
    const now = new Date();

    // Mark BREACHED
    const breached = await this.prisma.lead.updateMany({
      where: {
        slaDueDate: { lt: now },
        slaStatus: { not: 'BREACHED' },
        status: { notIn: ['WON', 'LOST', 'DROPPED', 'NEW'] },
      },
      data: { slaStatus: 'BREACHED', slaBreachedAt: now },
    });

    // Mark AT_RISK (within 24 hours of due date)
    const atRiskDate = dayjs().add(24, 'hour').toDate();
    await this.prisma.lead.updateMany({
      where: {
        slaDueDate: { gte: now, lte: atRiskDate },
        slaStatus: 'ON_TRACK',
        status: { notIn: ['WON', 'LOST', 'DROPPED', 'NEW'] },
      },
      data: { slaStatus: 'AT_RISK' },
    });

    if (breached.count > 0) {
      this.logger.warn(`SLA breached for ${breached.count} leads`);
      await this.createBreachNotifications();
    }
  }

  // Daily summary at 9 AM
  @Cron('0 9 * * *')
  async sendDailyAdminSummary() {
    this.logger.log('Generating daily SLA summary...');
    const summary = await this.getSummary();

    // Find all admin users
    const admins = await this.prisma.user.findMany({
      where: { role: 'ADMIN', isActive: true },
      select: { id: true },
    });

    for (const admin of admins) {
      await this.prisma.notification.create({
        data: {
          userId: admin.id,
          type: 'ADMIN_REPORT',
          title: 'Daily SLA Summary',
          body: `Breached: ${summary.breached} | At Risk: ${summary.atRisk} | On Track: ${summary.onTrack}`,
          metadata: summary as any,
        },
      });
    }
  }

  // Check inactivity: leads with no activity for 3+ days
  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async checkInactivity() {
    const threeDaysAgo = dayjs().subtract(3, 'day').toDate();
    const inactiveLeads = await this.prisma.lead.findMany({
      where: {
        lastActivityAt: { lt: threeDaysAgo },
        status: { notIn: ['WON', 'LOST', 'DROPPED', 'NEW'] },
        agentId: { not: null },
      },
      select: { id: true, studentName: true, agentId: true },
    });

    for (const lead of inactiveLeads) {
      if (!lead.agentId) continue;
      // Check if notification already sent today
      const today = dayjs().startOf('day').toDate();
      const existing = await this.prisma.notification.findFirst({
        where: {
          userId: lead.agentId,
          type: 'INACTIVITY',
          metadata: { path: ['leadId'], equals: lead.id },
          createdAt: { gte: today },
        },
      });
      if (!existing) {
        await this.prisma.notification.create({
          data: {
            userId: lead.agentId,
            type: 'INACTIVITY',
            title: 'Lead Inactive',
            body: `No activity on "${lead.studentName}" for 3+ days`,
            metadata: { leadId: lead.id } as any,
          },
        });
      }
    }
  }

  async getSummary() {
    const [breached, atRisk, onTrack, total] = await Promise.all([
      this.prisma.lead.count({ where: { slaStatus: 'BREACHED', status: { notIn: ['WON', 'LOST'] } } }),
      this.prisma.lead.count({ where: { slaStatus: 'AT_RISK', status: { notIn: ['WON', 'LOST'] } } }),
      this.prisma.lead.count({ where: { slaStatus: 'ON_TRACK', status: { notIn: ['WON', 'LOST'] } } }),
      this.prisma.lead.count({ where: { status: { notIn: ['WON', 'LOST'] } } }),
    ]);

    return { breached, atRisk, onTrack, total, generatedAt: new Date() };
  }

  async getBreachedLeads(agentId?: string) {
    const where: any = { slaStatus: 'BREACHED', status: { notIn: ['WON', 'LOST'] } };
    if (agentId) where.agentId = agentId;
    return this.prisma.lead.findMany({
      where,
      include: { agent: { select: { id: true, name: true } } },
      orderBy: { slaBreachedAt: 'asc' },
    });
  }

  private async createBreachNotifications() {
    const breachedLeads = await this.prisma.lead.findMany({
      where: { slaStatus: 'BREACHED', slaBreachedAt: { gte: dayjs().subtract(1, 'hour').toDate() } },
      select: { id: true, studentName: true, agentId: true },
    });

    for (const lead of breachedLeads) {
      if (lead.agentId) {
        await this.prisma.notification.create({
          data: {
            userId: lead.agentId,
            type: 'SLA_BREACH',
            title: 'SLA Breached',
            body: `SLA has been breached for lead: ${lead.studentName}`,
            metadata: { leadId: lead.id } as any,
          },
        });
      }
    }

    // Notify admins
    const admins = await this.prisma.user.findMany({ where: { role: 'ADMIN' }, select: { id: true } });
    for (const admin of admins) {
      await this.prisma.notification.create({
        data: {
          userId: admin.id,
          type: 'SLA_BREACH',
          title: `${breachedLeads.length} SLA Breach(es)`,
          body: `${breachedLeads.length} lead(s) breached SLA in the last hour`,
          metadata: { count: breachedLeads.length } as any,
        },
      });
    }
  }
}
