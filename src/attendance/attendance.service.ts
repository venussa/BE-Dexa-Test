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

    const isAdmin = user.role === 'ADMIN';
    const where: any = {};

    if (!isAdmin) {
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

    const rawData = await this.attendanceRepo.find({
      where,
      relations: ['user'],
      order: { timestamp: 'ASC' },
    });


    const groupedMap = new Map();
    for (const item of rawData) {
      const dateKey = item.timestamp.toISOString().split('T')[0];
      const groupKey = `${item.user.id}-${dateKey}`;

      if (!groupedMap.has(groupKey)) {
        groupedMap.set(groupKey, {
          user: {
            id: item.user.id,
            email: item.user.email,
            name: item.user.name,
            position: item.user.position,
            phone: item.user.phone,
            photoUrl: item.user.photoUrl,
          },
          checkin: null,
          checkout: null,
        });
      }

      const group = groupedMap.get(groupKey);
      if (item.type === 'CHECKIN') {
        group.checkin = item.timestamp;
      }
      if (item.type === 'CHECKOUT') {
        group.checkout = item.timestamp;
      }
    }

    const groupedArray = Array.from(groupedMap.values());
    const total = groupedArray.length;

    const pagedData = groupedArray.slice(
      (+page - 1) * +perPage,
      (+page - 1) * +perPage + +perPage
    );

    return {
      currentPage: +page,
      perPage: +perPage,
      total,
      data: pagedData,
    };
  }
}