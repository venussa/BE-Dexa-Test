import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Between, Repository } from 'typeorm';
import { startOfDay, endOfDay } from 'date-fns';
import { Attendance } from './attendance.entity';
import { User } from '../user/user.entity';
import { format, startOfMonth, endOfMonth } from 'date-fns';
@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private attendanceRepo: Repository<Attendance>,

    @InjectRepository(User)
    private userRepo: Repository<User>,
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
          dateKey,
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

  async getSummary(user: any, query: any) {

    const { page = 1, perPage = 10, start, end, userId } = query;
    const today = new Date();
    const startDate = start ? new Date(start) : startOfMonth(today);
    const endDate = end ? new Date(end) : endOfMonth(today);
    const sortOrder = String(query.sort).toLowerCase() === 'asc' ? 'asc' : 'desc';

    const isAdmin = user.role === 'ADMIN';
    const skip = (+page - 1) * +perPage;
    const take = +perPage;

    let users: User[] = [];

    if (isAdmin) {
      if (userId) {
        const found = await this.userRepo.findOne({ where: { id: userId } });
        if (found) users = [found];
      } else {
        users = await this.userRepo.find({
          order: { name: 'ASC' },
          skip,
          take,
        });
      }
    } else {
      const found = await this.userRepo.findOne({ where: { id: user.id } });
      if (found) users = [found];
    }

    const filteredUserIds = users.map((u) => u.id);
    const where: any = {
      user: { id: In(filteredUserIds) },
    };

    if (startDate && endDate) {
      where.timestamp = Between(startOfDay(startDate), endOfDay(endDate));
    }

    const rawAttendance = await this.attendanceRepo.find({
      where,
      relations: ['user'],
      order: { timestamp: 'ASC' },
    });

    const summaryMap = new Map<string, any>();

    for (const record of rawAttendance) {
      const date = format(record.timestamp, 'yyyy-MM-dd');
      const key = `${record.user.id}-${date}`;

      if (!summaryMap.has(key)) {
        summaryMap.set(key, {
          date,
          checkin: null,
          checkout: null,
          userId: record.user.id,
        });
      }

      const group = summaryMap.get(key);
      if (record.type === 'CHECKIN') group.checkin = record.timestamp;
      if (record.type === 'CHECKOUT') group.checkout = record.timestamp;
    }

    const data = users.map((u) => {
      const summary = Array.from(summaryMap.values())
        .filter((r) => r.userId === u.id)
        .map(({ date, checkin, checkout }) => ({
          date,
          checkin,
          checkout,
        }))
        .sort((a, b) => {
          if (sortOrder === 'asc') return a.date.localeCompare(b.date);
          else return b.date.localeCompare(a.date);
        });

      return {
        id: u.id,
        email: u.email,
        name: u.name,
        position: u.position,
        phone: u.phone,
        photoUrl: u.photoUrl,
        attendance_summary: summary,
      };
    });

    const total = isAdmin && !userId
      ? await this.userRepo.count()
      : data.length;

    return {
      currentPage: +page,
      perPage: take,
      total,
      data,
    };
  }
}