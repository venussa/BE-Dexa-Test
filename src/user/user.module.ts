import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { Attendance } from '../attendance/attendance.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Attendance])],
  controllers: [UserController],
  providers: [UserService]
})
export class UserModule {}
