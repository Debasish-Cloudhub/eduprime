import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CoursesService } from './courses.service';

@ApiTags('public')
@Controller('public')
export class PublicCoursesController {
  constructor(private coursesService: CoursesService) {}

  @Get('colleges')
  @ApiOperation({ summary: 'Public: list active colleges for landing page' })
  getColleges(
    @Query('limit')   limit?: string,
    @Query('page')    page?: string,
    @Query('search')  search?: string,
    @Query('country') country?: string,
  ) {
    return this.coursesService.findAllColleges({
      limit: Math.min(parseInt(limit || '50'), 100),
      page: parseInt(page || '1'),
      search: search || undefined,
      country: country || undefined,
    });
  }

  @Get('courses')
  @ApiOperation({ summary: 'Public: list active courses for landing page' })
  getCourses(
    @Query('limit')     limit?: string,
    @Query('page')      page?: string,
    @Query('collegeId') collegeId?: string,
    @Query('stream')    stream?: string,
    @Query('search')    search?: string,
    @Query('country')   country?: string,
  ) {
    const lim = parseInt(limit || '12');
    return this.coursesService.findAllCourses({
      limit: Math.min(lim, 100),
      page: parseInt(page || '1'),
      collegeId: collegeId || undefined,
      stream: stream || undefined,
      search: search || undefined,
      country: country || undefined,
    });
  }
}
