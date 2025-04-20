import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClassController } from './class.controller';
import { ClassService } from './class.service';
import { Class, ClassSchema } from './schemas/class.schema';
import { ClassStudent, ClassStudentSchema } from './schemas/class-student.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Class.name, schema: ClassSchema },
      { name: ClassStudent.name, schema: ClassStudentSchema },
    ]),
  ],
  controllers: [ClassController],
  providers: [ClassService],
  exports: [ClassService],
})
export class ClassModule {} 