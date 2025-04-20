import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { AttendanceModule } from './attendance/attendance.module';
import { CacheModule } from './cache/cache.module';
import { SyncModule } from './sync/sync.module';
import { AuthModule } from './auth/auth.module';
import { RealtimeGateway } from './realtime/realtime.gateway';
import { ClassModule } from './class/class.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION'),
        },
      }),
      inject: [ConfigService],
    }),
    AttendanceModule,
    CacheModule,
    SyncModule,
    AuthModule,
    ClassModule,
  ],
  providers: [RealtimeGateway],
})
export class AppModule {}
