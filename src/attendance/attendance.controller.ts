import { Controller, Post, Get, UseGuards, Query } from '@nestjs/common';
import { AttendanceService } from '@src/attendance/attendance.service';
import { JwtAuthGuard } from '@src/auth/jwt-auth.guard';
import { RolesGuard } from '@src/auth/guards/roles.guard';
import { Roles } from '@src/auth/decorators/roles.decorator';
import { User } from '@src/user/decorators/user.decorator';

@Controller('attendance')
export class AttendanceController {
    constructor(private readonly attendanceService: AttendanceService) {}

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('USER')
    @Post('checkin')
    async checkIn(@User('id') userId: string) {
        return this.attendanceService.checkIn(userId);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('USER')
    @Post('checkout')
    async checkOut(@User('id') userId: string) {
        return this.attendanceService.checkOut(userId);
    }

    @UseGuards(JwtAuthGuard)
    @Get('history')
    getHistory(@User() user, @Query() query: any) {
        return this.attendanceService.getHistory(user, query);
    }

    @UseGuards(JwtAuthGuard)
    @Get('summary')
    getSummary(@User() user, @Query() query: any) {
        return this.attendanceService.getSummary(user, query);
    }
}