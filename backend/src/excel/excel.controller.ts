import {
  Controller, Post, Get, Delete, Query, UseGuards, UseInterceptors,
  UploadedFile, Res, Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { ExcelService } from './excel.service';

@ApiTags('excel')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('excel')
export class ExcelController {
  constructor(private excelService: ExcelService) {}

  @Post('upload')
  @Roles('ADMIN')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload Excel to seed courses/colleges' })
  upload(@UploadedFile() file: Express.Multer.File, @Request() req: any) {
    if (!file) throw new Error('No file uploaded');
    return this.excelService.processUpload(file.buffer, file.originalname, req.user.id);
  }

  @Get('template')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Download Excel template' })
  async downloadTemplate(@Res() res: Response) {
    const buffer = await this.excelService.generateTemplate();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=eduprime_courses_template.xlsx');
    res.send(buffer);
  }

  @Get('history')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get Excel upload history' })
  history(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.excelService.getUploadHistory(
      parseInt(page || '1'), parseInt(limit || '20'),
    );
  }

  @Delete('history')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Clear old Excel upload history (keep last 5)' })
  async clearHistory() {
    return this.excelService.clearOldHistory(5);
  }
}
