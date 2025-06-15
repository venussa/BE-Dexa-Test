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

  async getHistory(user: any, query: any) {
    const { page = 1, perPage = 10, date, startDate, endDate, userId } = query;
    const take = +perPage;
    const skip = (+page - 1) * take;

    const where: any = {};

    if (user.role !== 'ADMIN') {
      where.user = { id: user.id };
    } else if (userId) {
      where.user = { id: userId };
    }

    if (date) {
      const d = new Date(date);
      where.timestamp = Between(startOfDay(d), endOfDay(d));
    } else if (startDate && endDate) {
      where.timestamp = Between(new Date(startDate), new Date(endDate));
    }

    const [data, total] = await this.attendanceRepo.findAndCount({
      where, take, skip, relations: ['user'], order: { timestamp: 'DESC' }
    });

    return {
      currentPage: +page,
      perPage: take,
      total,
      data,
    };
  }
}