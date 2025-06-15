import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { startOfDay, endOfDay } from 'date-fns';
import { Attendance } from './attendance.entity';
@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private attendanceRepo: Repository<Attendance>,
  ) {}

  async checkIn(userId: string) {
    const today = new Date();

    const alreadyCheckin = await this.attendanceRepo.findOne({
      where: {
        user: { id: userId },
        type: 'CHECKIN',
        timestamp: Between(startOfDay(today), endOfDay(today)),
      },
    });

    if (alreadyCheckin) {
      throw new BadRequestException('You have already checked in today');
    }

    const attendance = this.attendanceRepo.create({
      user: { id: userId },
      type: 'CHECKIN',
    });

    return this.attendanceRepo.save(attendance);
  }

  async checkOut(userId: string) {
    const today = new Date();

    const checkin = await this.attendanceRepo.findOne({
      where: {
        user: { id: userId },
        type: 'CHECKIN',
        timestamp: Between(startOfDay(today), endOfDay(today)),
      },
    });

    if (!checkin) {
      throw new BadRequestException('You must check in before checking out');
    }

    const alreadyCheckout = await this.attendanceRepo.findOne({
      where: {
        user: { id: userId },
        type: 'CHECKOUT',
        timestamp: Between(startOfDay(today), endOfDay(today)),
      },
    });

    if (alreadyCheckout) {
      throw new BadRequestException('You have already checked out today');
    }

    const attendance = this.attendanceRepo.create({
      user: { id: userId },
      type: 'CHECKOUT',
    });

    return this.attendanceRepo.save(attendance);
  }
}