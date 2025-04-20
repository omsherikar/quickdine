import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { AttendanceStatus } from '../../shared/dto/attendance.dto';
import { User } from '../../auth/schemas/user.schema';

export type AttendanceDocument = Attendance & Document;

@Schema({ timestamps: true })
export class Attendance {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: User.name, required: true })
  studentId: string;

  @Prop({ required: true })
  classId: string;

  @Prop({ required: true })
  date: string;

  @Prop({ required: true, enum: AttendanceStatus })
  status: AttendanceStatus;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: User.name, required: true })
  updatedBy: string;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const AttendanceSchema = SchemaFactory.createForClass(Attendance);

// Create compound index for efficient queries
AttendanceSchema.index({ studentId: 1, classId: 1, date: 1 }, { unique: true }); 