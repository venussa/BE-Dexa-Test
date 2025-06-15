import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from './attendance.entity';
import { User } from '../user/user.entity';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private attendanceRepo: Repository<Attendance>,

    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async checkIn(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    const attendance = this.attendanceRepo.create({ user: { id: user.id }, type: 'CHECKIN' });
    return this.attendanceRepo.save(attendance);
  }

  async checkOut(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    const attendance = this.attendanceRepo.create({ user: { id: user.id }, type: 'CHECKOUT' });
    return this.attendanceRepo.save(attendance);
  }
}