import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { Role } from '../shared/utils/constants';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userModel.findOne({ email });
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { 
      email: user.email, 
      sub: user._id,
      role: user.role
    };
    
    // Update last login
    await this.userModel.findByIdAndUpdate(user._id, { 
      lastLogin: new Date(),
      isActive: true
    });
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    };
  }

  async register(userData: any) {
    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email: userData.email });
    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }

    // Validate roll number for students
    if (userData.role === Role.STUDENT && !userData.rollNumber) {
      throw new UnauthorizedException('Roll number is required for students');
    }

    // Check if roll number already exists (for students)
    if (userData.rollNumber) {
      const existingRollNumber = await this.userModel.findOne({ rollNumber: userData.rollNumber });
      if (existingRollNumber) {
        throw new UnauthorizedException('Roll number already exists');
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    // Create new user
    const newUser = new this.userModel({
      ...userData,
      password: hashedPassword,
      role: userData.role || Role.STUDENT
    });
    
    await newUser.save();
    
    const { password, ...result } = newUser.toObject();
    return result;
  }

  async getUserById(id: string) {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const { password, ...result } = user.toObject();
    return result;
  }

  async getProfile(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const { password, ...result } = user.toObject();
    return result;
  }

  async getUsers(role?: string) {
    const query = role ? { role } : {};
    const users = await this.userModel.find(query).select('-password');
    return users;
  }
}
