import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IncentivesService } from '../incentives/incentives.service';
import { SlaService } from '../sla/sla.service';
import * as dayjs from 'dayjs';

export interface CreateLeadDto {
  studentName: string;
  studentEmail?: string;
  studentPhone?: string;
  city?: string;
  state?: string;
  qualification?: string;
  source?: string;
  priority?: number;
  notes?: string;
  tags?: string[];
  agentId?: string;
}

export interface UpdateLeadDto {
  studentName?: string;
  studentEmail?: string;
  studentPhone?: string;
  city?: string;
  state?: string;
  qualification?: string;
  priority?: number;
  notes?: string;
  tags?: string[];
  collegeId?: string;
  courseId?: string;
}

export interface TransitionLeadDto {
  status: string;
  note?: string;
  collegeId?: string;
  courseId?: string;
}

@Injectable()
export class LeadsService {
  constructor(
    private prisma: PrismaService,
    private incentivesService: IncentivesService,
    private slaService: SlaService,
  ) {}

  // SLA deadline map (days)
  private slaDeadlines: Record<string, number> = {
    INITIATED: 7,
    IN_PROGRESS: 15,
    DOCS_SUBMITTED: 10,
    OFFER_RECEIVED: 5,
  };

  async create(dto: CreateLeadDto, actorId: string) {
    // Dedup check — only if phone is provided
    if (dto.studentPhone) {
      const existing = await this.prisma.lead.findFirst({
        where: { studentPhone: dto.studentPhone, status: { not: 'LOST' } },
      });
      if (existing) {
        throw new BadRequestException(
          `Lead with phone ${dto.studentPhone} already exists (ID: ${existing.id})`,
        );
      }
    }

    const lead = await this.prisma.lead.create({
      data: {
        studentName: dto.studentName,
        studentEmail: dto.studentEmail,
        studentPhone: dto.studentPhone,
        city: dto.city,
        state: dto.state,
        qualification: dto.qualification,
        source: (dto.source as any) || 'WEBSITE',
        priority: dto.priority || 1,
        notes: dto.notes,
        tags: dto.tags || [],
        agentId: dto.agentId || actorId,  // default to creating user
        status: 'NEW',
        lastActivityAt: new Date(),
      },
      include: { agent: { select: { id: true, name: true, email: true } } },
    });

    await this.prisma.leadActivity.create({
      data: {
        leadId: lead.id,
        actorId,
        action: 'LEAD_CREATED',
        toValue: 'NEW',
        note: 'Lead created',
      },
    });

    return lead;
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    status?: string;
    agentId?: string;
    search?: string;
    slaStatus?: string;
    source?: string;
  }) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.agentId) where.agentId = query.agentId;
    if (query.slaStatus) where.slaStatus = query.slaStatus;
    if (query.source) where.source = query.source;
    if (query.search) {
      where.OR = [
        { studentName: { contains: query.search, mode: 'insensitive' } },
        { studentPhone: { contains: query.search } },
        { studentEmail: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [total, leads] = await Promise.all([
      this.prisma.lead.count({ where }),
      this.prisma.lead.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
        include: {
          agent: { select: { id: true, name: true, email: true } },
          college: { select: { id: true, name: true, city: true } },
          course: { select: { id: true, name: true, fees: true } },
          incentiveRecord: { select: { id: true, incentiveAmount: true, isLocked: true, paidAt: true } },
        },
      }),
    ]);

    return {
      data: leads,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
      include: {
        agent: { select: { id: true, name: true, email: true } },
        college: true,
        course: true,
        incentiveRecord: { select: { id: true, incentiveAmount: true, isLocked: true, paidAt: true } },
        activities: { orderBy: { createdAt: 'desc' }, take: 50 },
        documents: true,
      },
    });
    if (!lead) throw new NotFoundException('Lead not found');
    return lead;
  }

  async update(id: string, dto: UpdateLeadDto, actorId: string) {
    const lead = await this.findOne(id);
    if (['WON', 'LOST'].includes(lead.status)) {
      throw new BadRequestException('Cannot update closed leads');
    }

    // If college/course changed, recalculate incentive preview
    let incentivePreview: any = null;
    if (dto.courseId && dto.courseId !== lead.courseId) {
      incentivePreview = await this.incentivesService.calculatePreview(dto.courseId);
    }

    const updated = await this.prisma.lead.update({
      where: { id },
      data: {
        ...dto,
        lastActivityAt: new Date(),
      },
      include: {
        college: { select: { id: true, name: true } },
        course: { select: { id: true, name: true, fees: true } },
      },
    });

    await this.prisma.leadActivity.create({
      data: {
        leadId: id,
        actorId,
        action: 'LEAD_UPDATED',
        note: `Lead details updated`,
        metadata: { changes: Object.keys(dto) },
      },
    });

    return { lead: updated, incentivePreview };
  }

  async transition(id: string, dto: TransitionLeadDto, actor: any) {
    const lead = await this.findOne(id);

    // Validate transitions
    const validTransitions: Record<string, string[]> = {
      NEW: ['INITIATED', 'LOST'],
      INITIATED: ['IN_PROGRESS', 'LOST'],
      IN_PROGRESS: ['DOCS_SUBMITTED', 'LOST'],
      DOCS_SUBMITTED: ['OFFER_RECEIVED', 'LOST'],
      OFFER_RECEIVED: ['ENROLLED', 'LOST'],
      ENROLLED: ['WON', 'LOST'],
      WON: [],
      LOST: ['NEW'],
      DROPPED: ['NEW'],
    };

    if (!validTransitions[lead.status]?.includes(dto.status)) {
      throw new BadRequestException(
        `Invalid transition from ${lead.status} to ${dto.status}`,
      );
    }

    // Role-based transition restrictions
    if (dto.status === 'WON' && actor.role !== 'ADMIN' && actor.role !== 'SALES_AGENT') {
      throw new ForbiddenException('Only Admins/Sales Agents can mark WON');
    }

    const updateData: any = {
      status: dto.status,
      lastActivityAt: new Date(),
    };

    // Set SLA deadline
    if (this.slaDeadlines[dto.status]) {
      updateData.slaDueDate = dayjs()
        .add(this.slaDeadlines[dto.status], 'day')
        .toDate();
      updateData.slaStatus = 'ON_TRACK';
    }

    // Handle WON: lock incentive
    if (dto.status === 'WON') {
      updateData.wonAt = new Date();

      if (lead.courseId) {
        const incentiveData = await this.incentivesService.lockIncentive(
          lead.id,
          lead.courseId,
          actor.id,
        );
        updateData.feesAtClosure = incentiveData.feesAtClosure;
        updateData.incentiveAmount = incentiveData.incentiveAmount;
        updateData.incentiveSource = incentiveData.incentiveSource;
        updateData.incentiveLockedAt = new Date();
      }
    }

    if (dto.status === 'LOST') {
      updateData.lostAt = new Date();
    }

    // Update college/course if provided
    if (dto.collegeId) updateData.collegeId = dto.collegeId;
    if (dto.courseId) updateData.courseId = dto.courseId;

    const updated = await this.prisma.lead.update({
      where: { id },
      data: updateData,
      include: {
        college: { select: { id: true, name: true } },
        course: { select: { id: true, name: true } },
        incentiveRecord: { select: { id: true, incentiveAmount: true, isLocked: true, paidAt: true } },
      },
    });

    await this.prisma.leadActivity.create({
      data: {
        leadId: id,
        actorId: actor.id,
        action: 'STATUS_CHANGE',
        fromValue: lead.status,
        toValue: dto.status,
        note: dto.note || `Status changed to ${dto.status}`,
      },
    });

    return updated;
  }

  async assign(id: string, agentId: string, actorId: string) {
    const lead = await this.findOne(id);

    await this.prisma.lead.update({
      where: { id },
      data: { agentId, lastActivityAt: new Date() },
    });

    await this.prisma.leadActivity.create({
      data: {
        leadId: id,
        actorId,
        action: 'AGENT_ASSIGNED',
        fromValue: lead.agentId || 'unassigned',
        toValue: agentId,
      },
    });

    return { message: 'Lead assigned successfully' };
  }

  async addNote(id: string, note: string, actorId: string) {
    await this.findOne(id);
    await this.prisma.lead.update({
      where: { id },
      data: { lastActivityAt: new Date() },
    });

    return this.prisma.leadActivity.create({
      data: { leadId: id, actorId, action: 'NOTE_ADDED', note },
    });
  }

  async getActivities(id: string) {
    return this.prisma.leadActivity.findMany({
      where: { leadId: id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getIncentivePreview(leadId: string) {
    const lead = await this.findOne(leadId);
    if (!lead.courseId) {
      throw new BadRequestException('No course selected for this lead');
    }
    return this.incentivesService.calculatePreview(lead.courseId);
  }

  async delete(id: string) {
    await this.findOne(id);
    await this.prisma.leadActivity.deleteMany({ where: { leadId: id } });
    await this.prisma.lead.delete({ where: { id } });
    return { message: 'Lead deleted' };
  }

  async getBoardView(agentId?: string) {
    const statuses = ['NEW', 'INITIATED', 'IN_PROGRESS', 'DOCS_SUBMITTED', 'OFFER_RECEIVED', 'ENROLLED'];
    const where: any = {};
    if (agentId) where.agentId = agentId;

    const leads = await this.prisma.lead.findMany({
      where: { ...where, status: { in: statuses as any[] } },
      include: {
        agent: { select: { id: true, name: true } },
        college: { select: { id: true, name: true } },
        course: { select: { id: true, name: true } },
      },
      orderBy: { priority: 'desc' },
    });

    // Group by status
    return statuses.reduce((acc, status) => {
      acc[status] = leads.filter((l) => l.status === status);
      return acc;
    }, {} as Record<string, any[]>);
  }
}
