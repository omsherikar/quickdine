import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Role } from '../../shared/utils/constants';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: Object.values(Role), default: Role.STUDENT })
  role: string;

  @Prop({ unique: true, sparse: true })
  rollNumber: string;

  @Prop({ default: false })
  isActive: boolean;

  @Prop({ default: Date.now })
  lastLogin: Date;
}

export const UserSchema = SchemaFactory.createForClass(User); 