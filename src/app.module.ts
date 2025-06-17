import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmModuleConfig, typeOrmModuleLogConfig } from './config/db.config';
import { AuthModule } from './auth/auth.module';
import { AttendanceModule } from './attendance/attendance.module';
import { UserModule } from './user/user.module';
import { RabbitmqModule } from './rabbitmq/rabbitmq.module';
import { LoggingModule } from './logging/logging.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmModuleConfig),
    TypeOrmModule.forRoot(typeOrmModuleLogConfig),
    AuthModule,
    AttendanceModule,
    UserModule,
    RabbitmqModule,
    LoggingModule,
  ],
})
export class AppModule {}