import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CoursesService } from './courses.service';

@ApiTags('public')
@Controller('public')
export class PublicCoursesController {
  constructor(private coursesService: CoursesService) {}

  @Get('colleges')
  @ApiOperation({ summary: 'Public: list active colleges for landing page' })
  getColleges(@Query('limit') limit?: string, @Query('page') page?: string) {
    return this.coursesService.findAllColleges({
      limit: Math.min(parseInt(limit || '8'), 8),
      page: parseInt(page || '1'),
    });
  }

  @Get('courses')
  @ApiOperation({ summary: 'Public: list active courses for landing page' })
  getCourses(@Query('limit') limit?: string, @Query('page') page?: string) {
    return this.coursesService.findAllCourses({
      limit: Math.min(parseInt(limit || '8'), 8),
      page: parseInt(page || '1'),
    });
  }
}
