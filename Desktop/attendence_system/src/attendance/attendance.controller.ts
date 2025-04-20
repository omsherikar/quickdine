import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { MarkAttendanceDto } from '../shared/dto/attendance.dto';
import { JwtAuthGuard } from '../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../shared/guards/roles.guard';
import { Roles } from '../shared/decorators/roles.decorator';
import { Role } from '../shared/utils/constants';
import { AttendanceDocument } from './schemas/attendance.schema';
import { AttendanceStats } from '../shared/types/attendance.types';

@ApiTags('attendance')
@ApiBearerAuth()
@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  @Post()
  @Roles(Role.TEACHER, Role.ADMIN)
  @ApiOperation({ summary: 'Mark attendance for a student' })
  @ApiResponse({ status: 201, description: 'Attendance marked successfully' })
  async markAttendance(
    @Body() data: MarkAttendanceDto,
    @Request() req,
  ) {
    return this.attendanceService.markAttendance(data, req.user.sub);
  }

  @Post('bulk')
  @Roles(Role.TEACHER, Role.ADMIN)
  @ApiOperation({ summary: 'Mark attendance for multiple students' })
  @ApiResponse({ status: 201, description: 'Bulk attendance marked successfully' })
  async markBulkAttendance(
    @Body() data: { classId: string; date: string; records: Array<{ studentId: string; status: string }> },
    @Request() req,
  ): Promise<AttendanceDocument[]> {
    const results: AttendanceDocument[] = [];
    for (const record of data.records) {
      const attendanceData: MarkAttendanceDto = {
        classId: data.classId,
        date: new Date(data.date),
        studentId: record.studentId,
        status: record.status as any,
      };
      const result = await this.attendanceService.markAttendance(attendanceData, req.user.sub);
      results.push(result);
    }
    return results;
  }

  @Get('class/:classId')
  @Roles(Role.TEACHER, Role.ADMIN, Role.STUDENT)
  @ApiOperation({ summary: 'Get attendance for a class on a specific date' })
  @ApiResponse({ status: 200, description: 'Attendance records retrieved successfully' })
  async getClassAttendance(
    @Query('classId') classId: string,
    @Query('date') date: string,
  ) {
    return this.attendanceService.getAttendance(classId, new Date(date));
  }

  @Get('student/:studentId')
  @Roles(Role.TEACHER, Role.ADMIN, Role.STUDENT)
  @ApiOperation({ summary: 'Get attendance history for a student' })
  @ApiResponse({ status: 200, description: 'Returns student attendance history' })
  async getStudentAttendance(
    @Param('studentId') studentId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('classId') classId: string,
    @Request() req,
  ) {
    if (req.user.role === Role.STUDENT && req.user.sub !== studentId) {
      throw new UnauthorizedException('You can only view your own attendance history');
    }
    return this.attendanceService.getStudentAttendance(
      studentId,
      new Date(startDate),
      new Date(endDate),
      classId,
    );
  }

  @Get('class/:classId/history')
  @Roles(Role.TEACHER, Role.ADMIN)
  @ApiOperation({ summary: 'Get attendance history for a class' })
  @ApiResponse({ status: 200, description: 'Returns class attendance history' })
  async getClassAttendanceHistory(
    @Param('classId') classId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.attendanceService.getClassAttendance(
      classId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('student/:studentId/stats')
  @Roles(Role.TEACHER, Role.ADMIN, Role.STUDENT)
  @ApiOperation({ summary: 'Get attendance statistics for a student' })
  @ApiResponse({ status: 200, description: 'Returns student attendance statistics' })
  async getStudentStats(
    @Param('studentId') studentId: string,
    @Request() req,
  ): Promise<AttendanceStats> {
    if (req.user.role === Role.STUDENT && req.user.sub !== studentId) {
      throw new UnauthorizedException('You can only view your own attendance statistics');
    }
    return this.attendanceService.getStudentStats(studentId);
  }

  @Get('class/:classId/stats')
  @Roles(Role.TEACHER, Role.ADMIN)
  @ApiOperation({ summary: 'Get attendance statistics for all students in a class' })
  @ApiResponse({ status: 200, description: 'Returns class attendance statistics' })
  async getClassStats(
    @Param('classId') classId: string,
  ): Promise<AttendanceStats[]> {
    return this.attendanceService.getClassStats(classId);
  }
}
