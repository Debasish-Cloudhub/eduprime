import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: any, agentId: string) {
    const now = new Date();
    return this.prisma.expense.create({
      data: {
        agentId,
        category: dto.category,
        amount: parseFloat(dto.amount),
        description: dto.description,
        receiptUrl: dto.receiptUrl || null,
        month: dto.month || now.getMonth() + 1,
        year: dto.year || now.getFullYear(),
        status: 'PENDING',
      },
    });
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    agentId?: string;
    status?: string;
    month?: number;
    year?: number;
    category?: string;
  }) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const where: any = {};
    if (query.agentId) where.agentId = query.agentId;
    if (query.status) where.status = query.status;
    if (query.month) where.month = parseInt(query.month as any);
    if (query.year) where.year = parseInt(query.year as any);
    if (query.category) where.category = query.category;

    const [total, expenses] = await Promise.all([
      this.prisma.expense.count({ where }),
      this.prisma.expense.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { agent: { select: { id: true, name: true, email: true } } },
      }),
    ]);

    return {
      data: expenses,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const expense = await this.prisma.expense.findUnique({
      where: { id },
      include: { agent: { select: { id: true, name: true, email: true } } },
    });
    if (!expense) throw new NotFoundException('Expense not found');
    return expense;
  }

  async approve(id: string, adminId: string) {
    const expense = await this.findOne(id);
    if (expense.status !== 'PENDING') {
      throw new ForbiddenException('Only pending expenses can be approved');
    }
    return this.prisma.expense.update({
      where: { id },
      data: { status: 'APPROVED', approvedBy: adminId, approvedAt: new Date() },
    });
  }

  async reject(id: string, adminId: string, reason: string) {
    const expense = await this.findOne(id);
    if (expense.status !== 'PENDING') {
      throw new ForbiddenException('Only pending expenses can be rejected');
    }
    return this.prisma.expense.update({
      where: { id },
      data: { status: 'REJECTED', approvedBy: adminId, approvedAt: new Date(), rejectedReason: reason },
    });
  }

  async getMonthlySummary(year: number) {
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const summaries = await Promise.all(
      months.map(async (month) => {
        const result = await this.prisma.expense.aggregate({
          where: { month, year, status: 'APPROVED' },
          _sum: { amount: true },
          _count: true,
        });
        return {
          month,
          year,
          totalApproved: Number(result._sum.amount || 0),
          count: result._count,
        };
      }),
    );
    return summaries;
  }

  async getAgentSummary(agentId: string, month: number, year: number) {
    const result = await this.prisma.expense.groupBy({
      by: ['category', 'status'],
      where: { agentId, month, year },
      _sum: { amount: true },
      _count: true,
    });

    const total = await this.prisma.expense.aggregate({
      where: { agentId, month, year },
      _sum: { amount: true },
    });

    return {
      byCategory: result,
      total: Number(total._sum.amount || 0),
    };
  }

  async delete(id: string, requesterId: string, role: string) {
    const expense = await this.findOne(id);
    if (role !== 'ADMIN' && expense.agentId !== requesterId) {
      throw new ForbiddenException('Cannot delete another agent\'s expense');
    }
    if (expense.status === 'APPROVED') {
      throw new ForbiddenException('Cannot delete approved expenses');
    }
    await this.prisma.expense.delete({ where: { id } });
    return { message: 'Expense deleted' };
  }
}
