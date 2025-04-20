import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Class, ClassDocument } from './schemas/class.schema';
import { ClassStudent, ClassStudentDocument } from './schemas/class-student.schema';
import { PopulatedStudent } from '../shared/types/student.types';

@Injectable()
export class ClassService {
  constructor(
    @InjectModel(Class.name) private classModel: Model<ClassDocument>,
    @InjectModel(ClassStudent.name) private classStudentModel: Model<ClassStudentDocument>,
  ) {}

  async create(createClassDto: { name: string; teacherId: string }): Promise<ClassDocument> {
    const newClass = new this.classModel(createClassDto);
    return newClass.save();
  }

  async findAll(): Promise<ClassDocument[]> {
    return this.classModel.find().exec();
  }

  async findOne(id: string): Promise<ClassDocument> {
    const classDoc = await this.classModel.findById(id).exec();
    if (!classDoc) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }
    return classDoc;
  }

  async findByTeacher(teacherId: string): Promise<ClassDocument[]> {
    return this.classModel.find({ teacherId }).exec();
  }

  async addStudent(classId: string, studentId: string): Promise<ClassStudentDocument> {
    const classStudent = new this.classStudentModel({
      classId,
      studentId,
    });
    return classStudent.save();
  }

  async removeStudent(classId: string, studentId: string): Promise<void> {
    await this.classStudentModel.findOneAndUpdate(
      { classId, studentId },
      { isActive: false },
    );
  }

  async getStudents(classId: string): Promise<PopulatedStudent[]> {
    const classStudents = await this.classStudentModel
      .find({ classId, isActive: true })
      .populate<{ studentId: PopulatedStudent }>('studentId', 'name email rollNumber')
      .exec();

    return classStudents.map((cs) => ({
      _id: cs.studentId._id,
      name: cs.studentId.name,
      email: cs.studentId.email,
      rollNumber: cs.studentId.rollNumber,
    }));
  }

  async deleteClass(id: string): Promise<void> {
    const classDoc = await this.classModel.findById(id).exec();
    if (!classDoc) {
      throw new NotFoundException(`Class with ID ${id} not found`);
    }

    // Delete all class-student associations
    await this.classStudentModel.deleteMany({ classId: id }).exec();
    
    // Delete the class
    await this.classModel.findByIdAndDelete(id).exec();
  }
} 