import { Controller, Get, Post, Body, Param, UseGuards, Request, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ClassService } from './class.service';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../shared/guards/roles.guard';
import { Roles } from '../shared/decorators/roles.decorator';
import { Role } from '../shared/utils/constants';

@ApiTags('class')
@ApiBearerAuth()
@Controller('class')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClassController {
  constructor(private classService: ClassService) {}

  @Post()
  @Roles(Role.TEACHER, Role.ADMIN)
  @ApiOperation({ summary: 'Create a new class' })
  @ApiResponse({ status: 201, description: 'Class created successfully' })
  async create(@Body() createClassDto: { name: string }, @Request() req) {
    return this.classService.create({
      ...createClassDto,
      teacherId: req.user.sub,
    });
  }

  @Get()
  @Roles(Role.TEACHER, Role.ADMIN, Role.STUDENT)
  @ApiOperation({ summary: 'Get all classes' })
  @ApiResponse({ status: 200, description: 'Returns all classes' })
  async findAll() {
    return this.classService.findAll();
  }

  @Get(':id')
  @Roles(Role.TEACHER, Role.ADMIN, Role.STUDENT)
  @ApiOperation({ summary: 'Get a class by ID' })
  @ApiResponse({ status: 200, description: 'Returns the class' })
  async findOne(@Param('id') id: string) {
    return this.classService.findOne(id);
  }

  @Get('teacher/me')
  @Roles(Role.TEACHER)
  @ApiOperation({ summary: 'Get classes for the current teacher' })
  @ApiResponse({ status: 200, description: 'Returns teacher\'s classes' })
  async findMyClasses(@Request() req) {
    return this.classService.findByTeacher(req.user.sub);
  }

  @Get(':id/students')
  @Roles(Role.TEACHER, Role.ADMIN)
  @ApiOperation({ summary: 'Get students in a class' })
  @ApiResponse({ status: 200, description: 'Returns list of students in the class' })
  async getStudents(@Param('id') id: string) {
    return this.classService.getStudents(id);
  }

  @Post(':id/students')
  @Roles(Role.TEACHER, Role.ADMIN)
  @ApiOperation({ summary: 'Add a student to a class' })
  @ApiResponse({ status: 201, description: 'Student added to class successfully' })
  async addStudent(
    @Param('id') id: string,
    @Body() data: { studentId: string },
  ) {
    return this.classService.addStudent(id, data.studentId);
  }

  @Delete(':id/students/:studentId')
  @Roles(Role.TEACHER, Role.ADMIN)
  @ApiOperation({ summary: 'Remove a student from a class' })
  @ApiResponse({ status: 200, description: 'Student removed from class successfully' })
  async removeStudent(
    @Param('id') id: string,
    @Param('studentId') studentId: string,
  ) {
    return this.classService.removeStudent(id, studentId);
  }

  @Delete(':id')
  @Roles(Role.TEACHER, Role.ADMIN)
  @ApiOperation({ summary: 'Delete a class' })
  @ApiResponse({ status: 200, description: 'Class deleted successfully' })
  async delete(@Param('id') id: string) {
    await this.classService.deleteClass(id);
    return { message: 'Class deleted successfully' };
  }
} 