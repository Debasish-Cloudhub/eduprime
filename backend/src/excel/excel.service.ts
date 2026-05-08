import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CoursesService } from '../courses/courses.service';
import * as ExcelJS from 'exceljs';

// Expected Excel columns (case-insensitive header matching)
const COLUMN_MAP: Record<string, string> = {
  'college name': 'collegeName',
  'college': 'collegeName',
  'course name': 'courseName',
  'course': 'courseName',
  'stream': 'stream',
  'degree': 'degree',
  'duration': 'duration',
  'annual fees': 'annualFees',
  'fees': 'annualFees',
  'annual fee': 'annualFees',
  'total fees': 'totalFees',
  'total fee': 'totalFees',
  'incentive fixed': 'incentiveFixed',
  'fixed incentive': 'incentiveFixed',
  'incentive': 'incentiveFixed',
  'incentive %': 'incentivePct',
  'incentive pct': 'incentivePct',
  'incentive percent': 'incentivePct',
  'seats': 'seats',
  'eligibility': 'eligibility',
  'city': 'city',
  'state': 'state',
  'country': 'country',
  'college type': 'collegeType',
  'type': 'collegeType',
  'ranking': 'ranking',
  'description': 'description',
};

@Injectable()
export class ExcelService {
  private readonly logger = new Logger(ExcelService.name);

  constructor(
    private prisma: PrismaService,
    private coursesService: CoursesService,
  ) {}

  async processUpload(buffer: Buffer, filename: string, uploadedBy: string) {
    const uploadLog = await this.prisma.excelUpload.create({
      data: { filename, uploadedBy, status: 'PROCESSING' },
    });

    try {
      const rows = await this.parseExcel(buffer);
      this.logger.log(`Parsed ${rows.length} rows from ${filename}`);

      const result = await this.coursesService.bulkUpsertFromExcel(rows, uploadedBy);

      await this.prisma.excelUpload.update({
        where: { id: uploadLog.id },
        data: {
          rowsProcessed: rows.length,
          rowsCreated: result.created,
          rowsUpdated: result.updated,
          rowsFailed: result.failed,
          errors: result.errors as any,
          status: result.failed === rows.length ? 'FAILED' : result.failed > 0 ? 'PARTIAL' : 'SUCCESS',
          completedAt: new Date(),
        },
      });

      return {
        uploadId: uploadLog.id,
        rowsProcessed: rows.length,
        rowsCreated: result.created,
        rowsUpdated: result.updated,
        rowsFailed: result.failed,
        errors: result.errors,
        status: result.failed === 0 ? 'SUCCESS' : 'PARTIAL',
      };
    } catch (err) {
      await this.prisma.excelUpload.update({
        where: { id: uploadLog.id },
        data: { status: 'FAILED', errors: [{ error: err.message }] as any, completedAt: new Date() },
      });
      throw new BadRequestException(`Excel processing failed: ${err.message}`);
    }
  }

  private async parseExcel(buffer: Buffer): Promise<any[]> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as unknown as ArrayBuffer);

    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) throw new BadRequestException('Excel file has no worksheets');

    const rows: any[] = [];
    let headers: string[] = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) {
        // Parse headers
        headers = (row.values as any[])
          .slice(1)
          .map((h) => (h ? String(h).trim().toLowerCase() : ''));
        return;
      }

      const values = (row.values as any[]).slice(1);
      const obj: any = { __rowNum: rowNumber };
      let hasData = false;

      headers.forEach((header, i) => {
        const key = COLUMN_MAP[header];
        if (key && values[i] !== undefined && values[i] !== null) {
          obj[key] = values[i];
          hasData = true;
        }
      });

      if (hasData && obj.collegeName && obj.courseName) {
        rows.push(obj);
      }
    });

    if (rows.length === 0) {
      throw new BadRequestException(
        'No valid rows found. Ensure headers include: College Name, Course Name, Annual Fees',
      );
    }

    return rows;
  }

  async generateTemplate(): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Courses');

    // Headers
    sheet.columns = [
      { header: 'College Name', key: 'collegeName', width: 30 },
      { header: 'Course Name', key: 'courseName', width: 30 },
      { header: 'Stream', key: 'stream', width: 20 },
      { header: 'Degree', key: 'degree', width: 15 },
      { header: 'Duration', key: 'duration', width: 12 },
      { header: 'Annual Fees', key: 'annualFees', width: 15 },
      { header: 'Total Fees', key: 'totalFees', width: 15 },
      { header: 'Incentive Fixed', key: 'incentiveFixed', width: 18 },
      { header: 'Incentive %', key: 'incentivePct', width: 14 },
      { header: 'Seats', key: 'seats', width: 10 },
      { header: 'Eligibility', key: 'eligibility', width: 25 },
      { header: 'City', key: 'city', width: 15 },
      { header: 'State', key: 'state', width: 15 },
      { header: 'Country', key: 'country', width: 12 },
      { header: 'College Type', key: 'collegeType', width: 18 },
      { header: 'Ranking', key: 'ranking', width: 10 },
    ];

    // Style header row
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = {
      type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' },
    };
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    // Sample rows
    sheet.addRow({
      collegeName: 'IIT Delhi',
      courseName: 'B.Tech Computer Science',
      stream: 'Engineering',
      degree: 'B.Tech',
      duration: '4 years',
      annualFees: 200000,
      totalFees: 800000,
      incentiveFixed: 15000,
      incentivePct: '',
      seats: 120,
      eligibility: 'JEE Advanced',
      city: 'New Delhi',
      state: 'Delhi',
      country: 'India',
      collegeType: 'Government',
      ranking: 1,
    });
    sheet.addRow({
      collegeName: 'Manipal University',
      courseName: 'MBA',
      stream: 'Management',
      degree: 'MBA',
      duration: '2 years',
      annualFees: 450000,
      totalFees: 900000,
      incentiveFixed: '',
      incentivePct: 7,
      seats: 60,
      eligibility: 'CAT/MAT',
      city: 'Manipal',
      state: 'Karnataka',
      country: 'India',
      collegeType: 'Private',
      ranking: 15,
    });

    // Add validation notes
    const notesSheet = workbook.addWorksheet('Notes');
    notesSheet.addRow(['Field', 'Required', 'Notes']);
    notesSheet.addRow(['College Name', 'YES', 'Exact name used for deduplication']);
    notesSheet.addRow(['Course Name', 'YES', 'Exact name used for deduplication']);
    notesSheet.addRow(['Annual Fees', 'YES', 'Numeric only, in INR']);
    notesSheet.addRow(['Incentive Fixed', 'NO', 'If set, overrides Incentive %']);
    notesSheet.addRow(['Incentive %', 'NO', 'Used only if Incentive Fixed is empty. Fallback to system default (5%)']);
    notesSheet.addRow(['Country', 'NO', 'Defaults to "India"']);
    notesSheet.getRow(1).font = { bold: true };

    const arrayBuffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(arrayBuffer as ArrayBuffer);
  }

  async getUploadHistory(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [total, uploads] = await Promise.all([
      this.prisma.excelUpload.count(),
      this.prisma.excelUpload.findMany({
        skip, take: limit, orderBy: { createdAt: 'desc' },
      }),
    ]);
    return { data: uploads, meta: { total, page, limit } };
  }
  async clearOldHistory(keepLast: number = 5) {
    const records = await this.prisma.excelUpload.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    });
    if (records.length <= keepLast) return { deleted: 0, kept: records.length };
    const toDelete = records.slice(keepLast).map(r => r.id);
    await this.prisma.excelUpload.deleteMany({ where: { id: { in: toDelete } } });
    return { deleted: toDelete.length, kept: keepLast };
  }

}