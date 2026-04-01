import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ExcelService } from './excel.service';
import { ExcelController } from './excel.controller';
import { CoursesModule } from '../courses/courses.module';

@Module({
  imports: [
    MulterModule.register({ limits: { fileSize: 10 * 1024 * 1024 } }), // 10MB
    CoursesModule,
  ],
  providers: [ExcelService],
  controllers: [ExcelController],
  exports: [ExcelService],
})
export class ExcelModule {}
