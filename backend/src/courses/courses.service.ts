import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  // ─── COLLEGES ─────────────────────────────────────

  async createCollege(dto: any) {
    return this.prisma.college.create({ data: dto });
  }

  async findAllColleges(query: {
    page?: number;
    limit?: number;
    country?: string;
    search?: string;
  }) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const where: any = { isActive: true };
    if (query.country) where.country = query.country;
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { city: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [total, colleges] = await Promise.all([
      this.prisma.college.count({ where }),
      this.prisma.college.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { name: 'asc' },
        include: { _count: { select: { courses: true } } },
      }),
    ]);

    return {
      data: colleges,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOneCollege(id: string) {
    const college = await this.prisma.college.findUnique({
      where: { id },
      include: { courses: { where: { isActive: true }, orderBy: { name: 'asc' } } },
    });
    if (!college) throw new NotFoundException('College not found');
    return college;
  }

  async updateCollege(id: string, dto: any) {
    const data: any = {};
    if (dto.name !== undefined)         data.name = dto.name;
    if (dto.city !== undefined)         data.city = dto.city || null;
    if (dto.state !== undefined)        data.state = dto.state || null;
    if (dto.country !== undefined)      data.country = dto.country || 'India';
    if (dto.type !== undefined)         data.type = dto.type || null;
    if (dto.website !== undefined)      data.website = dto.website || null;
    if (dto.ranking !== undefined)      data.ranking = dto.ranking ? parseInt(String(dto.ranking)) : null;
    if (dto.currencyType !== undefined) data.currencyType = dto.currencyType || 'INR';
    return this.prisma.college.update({ where: { id }, data });
  }

  async deleteCollege(id: string) {
    await this.prisma.college.update({ where: { id }, data: { isActive: false } });
    return { message: 'College deleted successfully' };
  }

  // ─── COURSES ──────────────────────────────────────

  async createCourse(dto: any) {
    return this.prisma.course.create({
      data: dto,
      include: { college: { select: { id: true, name: true, city: true, country: true, currencyType: true } } },
    });
  }

  async findAllCourses(query: {
    page?: number;
    limit?: number;
    collegeId?: string;
    stream?: string;
    search?: string;
    maxFees?: number;
    country?: string;
  }) {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const where: any = { isActive: true };
    if (query.collegeId) where.collegeId = query.collegeId;
    if (query.stream)    where.stream = { contains: query.stream, mode: 'insensitive' };
    if (query.maxFees)   where.fees = { lte: query.maxFees };
    if (query.country)   where.college = { is: { country: { contains: query.country, mode: 'insensitive' } } };
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { degree: { contains: query.search, mode: 'insensitive' } },
        { stream: { contains: query.search, mode: 'insensitive' } },
        { college: { name: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    const [total, courses] = await Promise.all([
      this.prisma.course.count({ where }),
      this.prisma.course.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ college: { name: 'asc' } }, { name: 'asc' }],
        include: {
          college: { select: { id: true, name: true, city: true, country: true } },
        },
      }),
    ]);

    return {
      data: courses,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOneCourse(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: { college: true },
    });
    if (!course) throw new NotFoundException('Course not found');
    return course;
  }

  async updateCourse(id: string, dto: any) {
    // Clean and cast data to correct types before updating
    const data: any = {};
    if (dto.name !== undefined)          data.name = dto.name;
    if (dto.collegeId !== undefined)     data.collegeId = dto.collegeId;
    if (dto.stream !== undefined)        data.stream = dto.stream || null;
    if (dto.degree !== undefined)        data.degree = dto.degree || null;
    if (dto.duration !== undefined)      data.duration = dto.duration || null;
    if (dto.eligibility !== undefined)   data.eligibility = dto.eligibility || null;
    if (dto.description !== undefined)   data.description = dto.description || null;
    if (dto.seats !== undefined)         data.seats = dto.seats ? parseInt(String(dto.seats)) : null;
    if (dto.fees !== undefined) data.fees = (() => { const n = parseFloat(String(dto.fees ?? 0)); return isNaN(n) ? 0 : n; })();
    if (dto.totalFees !== undefined)     data.totalFees = dto.totalFees ? parseFloat(String(dto.totalFees)) : null;
    if (dto.incentiveFixed !== undefined) data.incentiveFixed = dto.incentiveFixed ? parseFloat(String(dto.incentiveFixed)) : null;
    if (dto.incentivePct !== undefined)  data.incentivePct = dto.incentivePct ? parseFloat(String(dto.incentivePct)) : null;
    if (dto.currencyType !== undefined)  data.currencyType = dto.currencyType || 'INR';
    if (dto.country !== undefined)       data.country = dto.country || null;

    return this.prisma.course.update({
      where: { id },
      data,
      include: { college: { select: { id: true, name: true, city: true, country: true, currencyType: true } } },
    });
  }

  async deleteCourse(id: string) {
    await this.prisma.course.delete({ where: { id } }).catch(() =>
      this.prisma.course.update({ where: { id }, data: { isActive: false } })
    );
    return { message: 'Course deleted successfully' };
  }

  async getStreams() {
    const courses = await this.prisma.course.findMany({
      where: { isActive: true, stream: { not: null } },
      select: { stream: true },
      distinct: ['stream'],
    });
    return courses.map((c) => c.stream).filter(Boolean).sort();
  }

  async bulkUpsertFromExcel(rows: any[], uploadedBy: string) {
    let created = 0;
    let updated = 0;
    let failed = 0;
    const errors: any[] = [];

    for (const row of rows) {
      try {
        // Upsert college
        let college = await this.prisma.college.findFirst({
          where: { name: { equals: row.collegeName, mode: 'insensitive' } },
        });

        if (!college) {
          college = await this.prisma.college.create({
            data: {
              name: row.collegeName,
              city: row.city || null,
              state: row.state || null,
              country: row.country || 'India',
              type: row.collegeType || null,
              ranking: row.ranking ? parseInt(row.ranking) : null,
              excelRowId: row.__rowNum?.toString(),
            },
          });
        } else {
          college = await this.prisma.college.update({
            where: { id: college.id },
            data: {
              city: row.city || college.city,
              state: row.state || college.state,
              country: row.country || college.country,
            },
          });
        }

        // Upsert course
        const existing = await this.prisma.course.findFirst({
          where: {
            name: { equals: row.courseName, mode: 'insensitive' },
            collegeId: college.id,
          },
        });

        const courseData = {
          name: row.courseName,
          collegeId: college.id,
          stream: row.stream || null,
          duration: row.duration || null,
          degree: row.degree || null,
          fees: parseFloat(row.annualFees) || 0,
          totalFees: row.totalFees ? parseFloat(row.totalFees) : null,
          incentiveFixed: row.incentiveFixed ? parseFloat(row.incentiveFixed) : null,
          incentivePct: row.incentivePct ? parseFloat(row.incentivePct) : null,
          seats: row.seats ? parseInt(row.seats) : null,
          eligibility: row.eligibility || null,
          description: row.description || null,
          country: row.courseCountry || row.country || null,
          currencyType: row.currencyType || 'INR',
          excelRowId: row.__rowNum?.toString(),
          isActive: true,
        };

        if (existing) {
          await this.prisma.course.update({ where: { id: existing.id }, data: courseData });
          updated++;
        } else {
          await this.prisma.course.create({ data: courseData });
          created++;
        }
      } catch (err) {
        failed++;
        errors.push({ row: row.__rowNum, error: err.message });
      }
    }

    return { created, updated, failed, errors };
  }
}
