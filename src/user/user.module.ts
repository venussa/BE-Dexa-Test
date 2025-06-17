import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { Attendance } from '../attendance/attendance.entity';
import { RabbitmqService } from '../rabbitmq/rabbitmq.service';
import { RabbitmqModule } from '../rabbitmq/rabbitmq.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Attendance]),
    RabbitmqModule,
  ],
  controllers: [UserController],
  providers: [UserService, RabbitmqService]
})
export class UserModule {}
