import { IsString, IsEmail, IsEnum, IsOptional, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../shared/utils/constants';

export class RegisterDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'student', enum: Role })
  @IsEnum(Role)
  role: string;

  @ApiProperty({ example: '2024001', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9A-Za-z-]+$/, {
    message: 'Roll number can only contain letters, numbers, and hyphens',
  })
  rollNumber?: string;
} 