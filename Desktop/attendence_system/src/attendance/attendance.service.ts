import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MarkAttendanceDto, AttendanceStatus } from '../shared/dto/attendance.dto';
import { Attendance, AttendanceDocument } from './schemas/attendance.schema';
import { User, UserDocument } from '../auth/schemas/user.schema';
import { Class, ClassDocument } from '../class/schemas/class.schema';
import { ClassService } from '../class/class.service';
import { PopulatedStudent } from '../shared/types/student.types';
import { AttendanceStats } from '../shared/types/attendance.types';

interface PopulatedUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  rollNumber?: string;
}

interface PopulatedClass {
  _id: Types.ObjectId;
  name: string;
  students: UserDocument[];
}

interface PopulatedAttendanceWithClass extends Omit<Attendance, 'studentId' | 'updatedBy' | 'classId'> {
  _id: string;
  studentId: PopulatedUser;
  updatedBy: PopulatedUser;
  classId: PopulatedClass;
}

interface ClassStats {
  className: string;
  totalDays: number;
  present: number;
  absent: number;
  late: number;
  percentage?: number;
}

interface StudentStats {
  studentName: string;
  totalDays: number;
  present: number;
  absent: number;
  late: number;
  percentage?: number;
}

interface PopulatedClassId {
  _id: string;
  name: string;
}

interface PopulatedStudentId {
  _id: string;
  name: string;
  email: string;
}

interface AttendanceWithPopulatedClass extends Omit<AttendanceDocument, 'classId'> {
  classId: PopulatedClassId;
}

interface AttendanceWithPopulatedStudent extends Omit<AttendanceDocument, 'studentId'> {
  studentId: PopulatedStudentId;
}

@Injectable()
export class AttendanceService {
  constructor(
    @InjectModel(Attendance.name) private attendanceModel: Model<AttendanceDocument>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Class.name) private classModel: Model<Class>,
    private classService: ClassService,
  ) {}

  private formatDate(date: Date): string {
    // Ensure we're working with UTC dates to avoid timezone issues
    const utcDate = new Date(Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate()
    ));
    return utcDate.toISOString().split('T')[0];
  }

  async markAttendance(data: MarkAttendanceDto, userId: string): Promise<AttendanceDocument> {
    try {
      const { studentId, classId, status, date } = data;
      const dateStr = this.formatDate(date);

      const attendance = await this.attendanceModel.findOneAndUpdate(
        {
          studentId,
          classId,
          date: dateStr,
        },
        {
          $set: {
            studentId,
            classId,
            date: dateStr,
            status,
            updatedBy: userId,
            updatedAt: new Date(),
          },
        },
        {
          upsert: true,
          new: true,
        }
      );

      return attendance;
    } catch (error) {
      console.error('Error marking attendance:', error);
      throw new InternalServerErrorException('Failed to mark attendance: ' + error.message);
    }
  }

  async getAttendance(classId: string, date: Date): Promise<any> {
    try {
      const dateStr = this.formatDate(date);
      const attendance = await this.attendanceModel.find({
        classId,
        date: dateStr,
      });

      const attendanceMap = attendance.reduce((acc, curr) => {
        acc[curr.studentId] = {
          status: curr.status,
          updatedBy: curr.updatedBy,
          updatedAt: curr.updatedAt,
        };
        return acc;
      }, {});

      return attendanceMap;
    } catch (error) {
      console.error('Error getting attendance:', error);
      throw new InternalServerErrorException('Failed to get attendance: ' + error.message);
    }
  }

  async getStudentAttendance(
    studentId: string, 
    startDate: Date, 
    endDate: Date,
    classId?: string
  ): Promise<any> {
    try {
      const startDateStr = this.formatDate(startDate);
      const endDateStr = this.formatDate(endDate);

      const query: any = {
        studentId,
        date: {
          $gte: startDateStr,
          $lte: endDateStr,
        },
      };

      if (classId) {
        query.classId = classId;
      }

      const records = await this.attendanceModel.find(query)
        .sort({ date: 1 })
        .populate<{ updatedBy: PopulatedUser }>('updatedBy', 'name')
        .populate<{ classId: PopulatedClass }>('classId', 'name')
        .populate<{ studentId: PopulatedUser }>('studentId', 'name email rollNumber')
        .lean() as PopulatedAttendanceWithClass[];

      return records.map(record => ({
        ...record,
        className: record.classId?.name || 'N/A',
        updatedBy: record.updatedBy?.name || 'Unknown User',
        studentName: record.studentId?.name,
        studentRollNumber: record.studentId?.rollNumber,
      }));
    } catch (error) {
      console.error('Error getting student attendance:', error);
      throw new InternalServerErrorException('Failed to get student attendance: ' + error.message);
    }
  }

  async getClassAttendance(classId: string, startDate: Date, endDate: Date): Promise<any[]> {
    try {
      const startDateStr = this.formatDate(startDate);
      const endDateStr = this.formatDate(endDate);

      const records = await this.attendanceModel.find({
        classId,
        date: {
          $gte: startDateStr,
          $lte: endDateStr,
        },
      })
      .sort({ date: 1 })
      .populate<{ studentId: PopulatedUser }>('studentId', 'name email rollNumber')
      .populate<{ updatedBy: PopulatedUser }>('updatedBy', 'name')
      .lean() as PopulatedAttendanceWithClass[];

      return records.map(record => ({
        ...record,
        studentName: record.studentId?.name,
        studentRollNumber: record.studentId?.rollNumber,
        updatedBy: record.updatedBy?.name || 'Unknown User',
      }));
    } catch (error) {
      console.error('Error getting class attendance:', error);
      throw new InternalServerErrorException('Failed to get class attendance: ' + error.message);
    }
  }

  async getStudentStats(studentId: string): Promise<AttendanceStats> {
    try {
      const attendanceRecords = await this.attendanceModel.find({ studentId }).exec();
      const studentInfo = await this.userModel.findById(studentId).lean().exec();

      if (!studentInfo) {
        throw new NotFoundException('Student not found');
      }

      const stats: AttendanceStats = {
        totalDays: attendanceRecords.length,
        present: attendanceRecords.filter(record => record.status === AttendanceStatus.PRESENT).length,
        absent: attendanceRecords.filter(record => record.status === AttendanceStatus.ABSENT).length,
        late: attendanceRecords.filter(record => record.status === AttendanceStatus.LATE).length,
        name: studentInfo.name,
        attendancePercentage: 0
      };

      stats.attendancePercentage = stats.totalDays > 0
        ? ((stats.present + stats.late) / stats.totalDays) * 100
        : 0;

      return stats;
    } catch (error) {
      console.error('Error getting student stats:', error);
      throw new InternalServerErrorException('Failed to get student statistics');
    }
  }

  async getClassStats(classId: string): Promise<AttendanceStats[]> {
    try {
      const students = await this.classService.getStudents(classId);
      
      const stats = await Promise.all(
        students.map(async (student) => {
          const attendanceRecords = await this.attendanceModel.find({
            studentId: student._id,
            classId
          }).exec();

          const studentStats: AttendanceStats = {
            totalDays: attendanceRecords.length,
            present: attendanceRecords.filter(record => record.status === AttendanceStatus.PRESENT).length,
            absent: attendanceRecords.filter(record => record.status === AttendanceStatus.ABSENT).length,
            late: attendanceRecords.filter(record => record.status === AttendanceStatus.LATE).length,
            name: student.name,
            attendancePercentage: 0
          };

          studentStats.attendancePercentage = studentStats.totalDays > 0
            ? ((studentStats.present + studentStats.late) / studentStats.totalDays) * 100
            : 0;

          return studentStats;
        })
      );

      return stats;
    } catch (error) {
      console.error('Error getting class stats:', error);
      throw new InternalServerErrorException('Failed to get class statistics');
    }
  }
}
