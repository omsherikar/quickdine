import { Injectable, UnauthorizedException, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { Role } from '../shared/utils/constants';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { randomBytes } from 'crypto';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private mailerService: MailerService,
    private configService: ConfigService,
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

    // Only validate roll number for students
    if (userData.role === Role.STUDENT) {
      if (!userData.rollNumber) {
        throw new UnauthorizedException('Roll number is required for students');
      }
      
      // Check if roll number already exists
      const existingRollNumber = await this.userModel.findOne({ rollNumber: userData.rollNumber });
      if (existingRollNumber) {
        throw new UnauthorizedException('Roll number already exists');
      }
    }

    // Remove roll number for non-student roles
    if (userData.role !== Role.STUDENT) {
      delete userData.rollNumber;
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

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    try {
      const user = await this.userModel.findOne({ email: forgotPasswordDto.email });
      if (!user) {
        // Don't reveal if the email exists or not
        return { message: 'If your email is registered, you will receive a password reset link.' };
      }

      // Generate reset token
      const resetToken = randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

      // Save reset token to user
      await this.userModel.findByIdAndUpdate(user._id, {
        resetToken,
        resetTokenExpiry,
      });

      // Send reset email
      const frontendUrl = this.configService.get<string>('FRONTEND_URL');
      const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;
      
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Password Reset Request',
        template: 'password-reset',
        context: {
          name: user.name,
          resetUrl,
        },
      });

      return { message: 'If your email is registered, you will receive a password reset link.' };
    } catch (error) {
      console.error('Error in forgotPassword:', error);
      throw new BadRequestException('Failed to process password reset request');
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    try {
      const user = await this.userModel.findOne({
        resetToken: resetPasswordDto.token,
        resetTokenExpiry: { $gt: new Date() },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid or expired reset token');
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(resetPasswordDto.password, 10);

      // Update password and clear reset token
      await this.userModel.findByIdAndUpdate(user._id, {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      });

      return { message: 'Password has been reset successfully' };
    } catch (error) {
      console.error('Error in resetPassword:', error);
      throw new BadRequestException('Failed to reset password');
    }
  }

  async updateProfile(userId: string, file: Express.Multer.File) {
    const photoUrl = `/uploads/${file.filename}`;
    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      { photoUrl },
      { new: true }
    ).select('-password');
    
    if (!updatedUser) {
      throw new UnauthorizedException('User not found');
    }
    
    return updatedUser;
  }

  async updatePhoto(userId: string, file: Express.Multer.File): Promise<{ photoUrl: string }> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Save the file path relative to the uploads directory
      const photoUrl = `/uploads/${file.filename}`;
      user.photoUrl = photoUrl;
      await user.save();

      return { photoUrl };
    } catch (error) {
      throw new InternalServerErrorException('Failed to update profile photo');
    }
  }
}
