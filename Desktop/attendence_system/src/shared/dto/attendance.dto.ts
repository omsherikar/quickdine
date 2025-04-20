import { IsString, IsDate, IsEnum, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
}

export class MarkAttendanceDto {
  @ApiProperty({ description: 'Student ID' })
  @IsMongoId()
  studentId: string;

  @ApiProperty({ description: 'Class ID' })
  @IsMongoId()
  classId: string;

  @ApiProperty({ description: 'Attendance status', enum: AttendanceStatus })
  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;

  @ApiProperty({ description: 'Date of attendance' })
  @Type(() => Date)
  @IsDate()
  date: Date;
}

export class SyncAttendanceDto {
  @ApiProperty({ description: 'Last sync timestamp' })
  @Type(() => Date)
  @IsDate()
  lastSync: Date;

  @ApiProperty({ description: 'Array of attendance records' })
  records: MarkAttendanceDto[];
}

export class AttendanceResponseDto {
  @ApiProperty({ description: 'Attendance ID' })
  @IsMongoId()
  id: string;

  @ApiProperty({ description: 'Student ID' })
  @IsMongoId()
  studentId: string;

  @ApiProperty({ description: 'Class ID' })
  @IsMongoId()
  classId: string;

  @ApiProperty({ description: 'Attendance status', enum: AttendanceStatus })
  @IsEnum(AttendanceStatus)
  status: AttendanceStatus;

  @ApiProperty({ description: 'Date of attendance' })
  @Type(() => Date)
  @IsDate()
  date: Date;

  @ApiProperty({ description: 'Last modified timestamp' })
  @Type(() => Date)
  @IsDate()
  updatedAt: Date;
}
