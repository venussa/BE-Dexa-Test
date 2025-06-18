import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceService } from '@src/attendance/attendance.service';
import { AttendanceController } from '@src/attendance/attendance.controller';
import { Attendance } from '@src/attendance/attendance.entity';
import { User } from '@src/user/user.entity';

@Module({
    imports: [
      TypeOrmModule.forFeature([Attendance, User])
    ],
    controllers: [AttendanceController],
    providers: [AttendanceService],
})

export class AttendanceModule {}
