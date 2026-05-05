import {
  Controller, Get, Post, Put, Delete, Param, Query, Body, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/roles.guard';
import { CoursesService } from './courses.service';

@ApiTags('courses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('courses')
export class CoursesController {
  constructor(private coursesService: CoursesService) {}

  // ─── COLLEGES ─────────────────────────────────────

  @Post('colleges')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  createCollege(@Body() dto: any) {
    return this.coursesService.createCollege(dto);
  }

  @Get('colleges')
  @UseGuards()
  @ApiOperation({ summary: 'List all colleges - public endpoint' })
  findAllColleges(@Query() query: any) {
    return this.coursesService.findAllColleges(query);
  }

  @Get('colleges/:id')
  findOneCollege(@Param('id') id: string) {
    return this.coursesService.findOneCollege(id);
  }

  @Put('colleges/:id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  updateCollege(@Param('id') id: string, @Body() dto: any) {
    return this.coursesService.updateCollege(id, dto);
  }

  @Delete('colleges/:id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  deleteCollege(@Param('id') id: string) {
    return this.coursesService.deleteCollege(id);
  }

  // ─── COURSES ──────────────────────────────────────

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  createCourse(@Body() dto: any) {
    return this.coursesService.createCourse(dto);
  }

  @Get()
  @UseGuards()
  @ApiOperation({ summary: 'List all courses - public endpoint' })
  findAllCourses(@Query() query: any) {
    return this.coursesService.findAllCourses(query);
  }

  @Get('streams')
  @ApiOperation({ summary: 'Get distinct stream list' })
  getStreams() {
    return this.coursesService.getStreams();
  }

  @Get(':id')
  findOneCourse(@Param('id') id: string) {
    return this.coursesService.findOneCourse(id);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  updateCourse(@Param('id') id: string, @Body() dto: any) {
    return this.coursesService.updateCourse(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  deleteCourse(@Param('id') id: string) {
    return this.coursesService.deleteCourse(id);
  }
}
