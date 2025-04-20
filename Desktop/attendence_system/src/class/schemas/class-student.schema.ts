import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ClassStudentDocument = ClassStudent & Document;

@Schema({ timestamps: true })
export class ClassStudent {
  @Prop({ type: Types.ObjectId, ref: 'Class', required: true })
  classId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  studentId: Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;
}

export const ClassStudentSchema = SchemaFactory.createForClass(ClassStudent); 