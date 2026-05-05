import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { PublicCoursesController } from './public.courses.controller';

@Module({
  providers: [CoursesService],
  controllers: [CoursesController, PublicCoursesController],
  exports: [CoursesService],
})
export class CoursesModule {}
