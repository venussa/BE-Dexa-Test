import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmModuleConfig, typeOrmModuleLogConfig } from '@src/config/db.config';
import { AuthModule } from '@src/auth/auth.module';
import { AttendanceModule } from '@src/attendance/attendance.module';
import { UserModule } from '@src/user/user.module';
import { RabbitmqModule } from '@src/rabbitmq/rabbitmq.module';
import { LoggingModule } from '@src/logging/logging.module';
import { FcmModule } from './fcm/fcm.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmModuleConfig),
    TypeOrmModule.forRoot(typeOrmModuleLogConfig),
    AuthModule,
    AttendanceModule,
    UserModule,
    RabbitmqModule,
    LoggingModule,
    FcmModule,
  ],
})
export class AppModule {}