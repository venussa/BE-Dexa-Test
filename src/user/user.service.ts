import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { format, startOfDay, endOfDay } from 'date-fns';
import { User } from './user.entity';
import { Attendance } from '../attendance/attendance.entity';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepo: Repository<User>,

        @InjectRepository(Attendance)
        private attendanceRepo: Repository<Attendance>
      ) {}

    async getFullUserById(id: string) {
        const user = await this.userRepo.findOne({ where: { id} });
        if (!user) throw new NotFoundException('User not found');

        const today = new Date();
        const { password, ...result } = user;
        const latestAttendance = await this.attendanceRepo.findOne({
            where: {
                user: { id },
                timestamp: Between(startOfDay(today), endOfDay(today)),
            },
            order: { timestamp: 'DESC' },
        });

        return {
            ...result,
            createdAt: format(result.createdAt, 'yyyy-MM-dd HH:mm:ss'),
            updatedAt: format(result.updatedAt, 'yyyy-MM-dd HH:mm:ss'),
            attendanceStatus: latestAttendance?.type || 'NONE',
        };
    }
}
