import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { CacheModule } from '../cache/cache.module';
import { SyncModule } from '../sync/sync.module';
import { Attendance, AttendanceSchema } from './schemas/attendance.schema';
import { User, UserSchema } from '../auth/schemas/user.schema';
import { Class, ClassSchema } from '../class/schemas/class.schema';
import { ClassModule } from '../class/class.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Attendance.name, schema: AttendanceSchema },
      { name: User.name, schema: UserSchema },
      { name: Class.name, schema: ClassSchema },
    ]),
    CacheModule,
    SyncModule,
    ClassModule,
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [AttendanceService],
})
export class AttendanceModule {}
