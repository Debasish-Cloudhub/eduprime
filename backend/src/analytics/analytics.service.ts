import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as dayjs from 'dayjs';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboard(role: string, userId: string) {
    const agentFilter = role === 'SALES_AGENT' ? { agentId: userId } : {};

    const [totalLeads, wonLeads, lostLeads, activeLeads, slaBreached, pendingExpenses,
           totalCourses, totalColleges, sulekhaTotal, sulekhaLastSync] =
      await Promise.all([
        this.prisma.lead.count({ where: agentFilter }),
        this.prisma.lead.count({ where: { ...agentFilter, status: 'WON' } }),
        this.prisma.lead.count({ where: { ...agentFilter, status: 'LOST' } }),
        this.prisma.lead.count({ where: { ...agentFilter, status: { notIn: ['WON', 'LOST', 'DROPPED'] } } }),
        this.prisma.lead.count({ where: { ...agentFilter, slaStatus: 'BREACHED' } }),
        this.prisma.expense.count({ where: { status: 'PENDING', ...(role === 'SALES_AGENT' ? { agentId: userId } : {}) } }),
        this.prisma.course.count({ where: { isActive: true } }),
        this.prisma.college.count({ where: { isActive: true } }),
        this.prisma.sulekhaSync.aggregate({ _sum: { leadsCreated: true, leadsFound: true, leadsDuplicate: true } }),
        this.prisma.sulekhaSync.findFirst({ orderBy: { startedAt: 'desc' }, select: { startedAt: true, status: true, leadsFound: true, leadsCreated: true } }),
      ]);

    const conversionRate = totalLeads > 0 ? ((wonLeads / totalLeads) * 100).toFixed(1) : '0';

    const incentiveSummary = await this.prisma.incentiveRecord.aggregate({
      where: { isLocked: true, ...(role === 'SALES_AGENT' ? { agentId: userId } : {}) },
      _sum: { incentiveAmount: true },
    });

    return {
      totalLeads,
      wonLeads,
      lostLeads,
      activeLeads,
      slaBreached,
      pendingExpenses,
      conversionRate: parseFloat(conversionRate),
      totalIncentiveLocked: Number(incentiveSummary._sum.incentiveAmount || 0),
      totalCourses,
      totalColleges,
      sulekha: {
        totalLeadsFound:     Number(sulekhaTotal._sum.leadsFound     || 0),
        totalLeadsCreated:   Number(sulekhaTotal._sum.leadsCreated   || 0),
        totalDuplicates:     Number(sulekhaTotal._sum.leadsDuplicate || 0),
        lastSyncAt:          sulekhaLastSync?.startedAt ?? null,
        lastSyncStatus:      sulekhaLastSync?.status ?? null,
        lastSyncLeadsFound:  sulekhaLastSync?.leadsFound ?? 0,
        lastSyncLeadsCreated: sulekhaLastSync?.leadsCreated ?? 0,
      },
    };
  }

  async getFunnel(agentId?: string) {
    const statuses = ['NEW', 'INITIATED', 'IN_PROGRESS', 'DOCS_SUBMITTED', 'OFFER_RECEIVED', 'ENROLLED', 'WON', 'LOST'];
    const where: any = agentId ? { agentId } : {};

    const counts = await Promise.all(
      statuses.map((status) =>
        this.prisma.lead.count({ where: { ...where, status: status as any } }).then((count) => ({ status, count })),
      ),
    );

    return counts;
  }

  async getConversionBySource() {
    const sources = ['SULEKHA', 'WEBSITE', 'REFERRAL', 'WALK_IN', 'SOCIAL_MEDIA', 'OTHER'];

    const data = await Promise.all(
      sources.map(async (source) => {
        const [total, won] = await Promise.all([
          this.prisma.lead.count({ where: { source: source as any } }),
          this.prisma.lead.count({ where: { source: source as any, status: 'WON' } }),
        ]);
        return {
          source,
          total,
          won,
          conversionRate: total > 0 ? parseFloat(((won / total) * 100).toFixed(1)) : 0,
        };
      }),
    );

    return data.filter((d) => d.total > 0);
  }

  async getRevenueVsExpense(year: number) {
    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    return Promise.all(
      months.map(async (month) => {
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0, 23, 59, 59);

        const [incentives, expenses] = await Promise.all([
          this.prisma.incentiveRecord.aggregate({
            where: { isLocked: true, lockedAt: { gte: start, lte: end } },
            _sum: { incentiveAmount: true },
          }),
          this.prisma.expense.aggregate({
            where: { status: 'APPROVED', month, year },
            _sum: { amount: true },
          }),
        ]);

        return {
          month,
          year,
          incentives: Number(incentives._sum.incentiveAmount || 0),
          expenses: Number(expenses._sum.amount || 0),
        };
      }),
    );
  }

  async getAgentLeaderboard(month?: number, year?: number) {
    const agents = await this.prisma.user.findMany({
      where: { role: 'SALES_AGENT', isActive: true },
      select: { id: true, name: true, email: true },
    });

    const leaderboard = await Promise.all(
      agents.map(async (agent) => {
        const dateFilter =
          month && year
            ? { wonAt: { gte: new Date(year, month - 1, 1), lte: new Date(year, month, 0) } }
            : {};

        const [won, total, incentives] = await Promise.all([
          this.prisma.lead.count({ where: { agentId: agent.id, status: 'WON', ...dateFilter } }),
          this.prisma.lead.count({ where: { agentId: agent.id } }),
          this.prisma.incentiveRecord.aggregate({
            where: { agentId: agent.id, isLocked: true },
            _sum: { incentiveAmount: true },
          }),
        ]);

        return {
          agent,
          won,
          total,
          conversionRate: total > 0 ? parseFloat(((won / total) * 100).toFixed(1)) : 0,
          totalIncentive: Number(incentives._sum.incentiveAmount || 0),
        };
      }),
    );

    return leaderboard.sort((a, b) => b.won - a.won);
  }

  async getLeadTrend(days = 30, agentId?: string) {
    const where: any = agentId ? { agentId } : {};
    const start = dayjs().subtract(days, 'day').toDate();

    const leads = await this.prisma.lead.findMany({
      where: { ...where, createdAt: { gte: start } },
      select: { createdAt: true, status: true },
    });

    // Group by date
    const grouped: Record<string, { date: string; total: number; won: number }> = {};
    leads.forEach((lead) => {
      const date = dayjs(lead.createdAt).format('YYYY-MM-DD');
      if (!grouped[date]) grouped[date] = { date, total: 0, won: 0 };
      grouped[date].total++;
      if (lead.status === 'WON') grouped[date].won++;
    });

    return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
  }
}
