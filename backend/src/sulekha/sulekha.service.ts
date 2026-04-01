import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SulekhaService {
  private readonly logger = new Logger(SulekhaService.name);

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  // Daily cron at 6 AM
  @Cron('0 6 * * *')
  async cronSync() {
    this.logger.log('Sulekha cron sync triggered');
    await this.sync('CRON');
  }

  async sync(triggeredBy: 'CRON' | 'MANUAL' = 'MANUAL') {
    const syncLog = await this.prisma.sulekhaSync.create({
      data: { triggeredBy, status: 'RUNNING' },
    });

    try {
      const leads = await this.fetchFromSulekha();

      let created = 0;
      let duplicate = 0;
      const errors: any[] = [];

      for (const lead of leads) {
        try {
          // Dedup by sulekhaId or phone or email
          const existing = await this.prisma.lead.findFirst({
            where: {
              OR: [
                { sulekhaId: lead.id?.toString() },
                { studentPhone: lead.phone },
                ...(lead.email ? [{ studentEmail: lead.email }] : []),
              ],
            },
          });

          if (existing) {
            duplicate++;
            continue;
          }

          await this.prisma.lead.create({
            data: {
              studentName: lead.name || 'Unknown',
              studentEmail: lead.email || null,
              studentPhone: lead.phone,
              city: lead.city || null,
              state: lead.state || null,
              source: 'SULEKHA',
              status: 'NEW',
              sulekhaId: lead.id?.toString(),
              sulekhaData: lead as any,
              lastActivityAt: new Date(),
            },
          });
          created++;
        } catch (err) {
          errors.push({ lead: lead.phone, error: err.message });
        }
      }

      await this.prisma.sulekhaSync.update({
        where: { id: syncLog.id },
        data: {
          status: errors.length > 0 ? 'PARTIAL' : 'SUCCESS',
          leadsFound: leads.length,
          leadsCreated: created,
          leadsDuplicate: duplicate,
          errors: errors as any,
          completedAt: new Date(),
        },
      });

      return { leadsFound: leads.length, leadsCreated: created, leadsDuplicate: duplicate, errors };
    } catch (err) {
      this.logger.error('Sulekha sync failed:', err.message);
      await this.prisma.sulekhaSync.update({
        where: { id: syncLog.id },
        data: { status: 'FAILED', errors: [{ error: err.message }] as any, completedAt: new Date() },
      });
      throw err;
    }
  }

  private async fetchFromSulekha(): Promise<any[]> {
    const apiKey = this.config.get<string>('SULEKHA_API_KEY');
    const apiUrl = this.config.get<string>('SULEKHA_API_URL');

    if (!apiKey || !apiUrl) {
      this.logger.warn('Sulekha credentials not configured — using mock data');
      return this.getMockLeads();
    }

    try {
      const resp = await fetch(`${apiUrl}/leads?apiKey=${apiKey}&limit=100`, {
        headers: { 'Content-Type': 'application/json' },
      });
      if (!resp.ok) throw new Error(`Sulekha API error: ${resp.status}`);
      const data = await resp.json();
      return data.leads || data.data || [];
    } catch (err) {
      this.logger.error('Sulekha API fetch failed:', err.message);
      throw err;
    }
  }

  private getMockLeads() {
    return [
      { id: 'SUL001', name: 'Arjun Sharma', phone: '9876540001', email: 'arjun@test.com', city: 'Mumbai', state: 'Maharashtra' },
      { id: 'SUL002', name: 'Priya Nair', phone: '9876540002', email: 'priya@test.com', city: 'Chennai', state: 'Tamil Nadu' },
      { id: 'SUL003', name: 'Rahul Gupta', phone: '9876540003', email: 'rahul@test.com', city: 'Delhi', state: 'Delhi' },
    ];
  }

  async getSyncLogs(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [total, logs] = await Promise.all([
      this.prisma.sulekhaSync.count(),
      this.prisma.sulekhaSync.findMany({ skip, take: limit, orderBy: { startedAt: 'desc' } }),
    ]);
    return { data: logs, meta: { total, page, limit } };
  }
}
