import { Controller, Post, UseGuards } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../user/decorators/user.decorator';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @UseGuards(JwtAuthGuard)
  @Post('checkin')
  async checkIn(@User('id') userId: string) {
    return this.attendanceService.checkIn(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('checkout')
  async checkOut(@User('id') userId: string) {
    return this.attendanceService.checkOut(userId);
  }
}