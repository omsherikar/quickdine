import { Types } from 'mongoose';

export interface PopulatedStudent {
  _id: Types.ObjectId;
  name: string;
  email: string;
  rollNumber?: string;
} 