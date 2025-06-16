import * as bcrypt from 'bcrypt';
import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { format, startOfDay, endOfDay } from 'date-fns';
import { User } from './user.entity';
import { Attendance } from '../attendance/attendance.entity';
import { UpdateUserDto } from './dto/update-user.dto';

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

    async updateUser(currentUser: User, targetUserId: string, dto: UpdateUserDto) {
        if (currentUser.role !== 'ADMIN' && currentUser.id !== targetUserId) {
            throw new ForbiddenException('You are not allowed to update this user');
        }

        const user = await this.userRepo.findOne({ where: { id: targetUserId } });
        if (!user) throw new NotFoundException('User not found');
        
        if (dto.email) {
            if (currentUser.role !== 'ADMIN') {
                throw new ForbiddenException('Only admin can update email');
            }

            const existingEmailUser = await this.userRepo.findOne({
                where: { email: dto.email },
            });

            if (existingEmailUser && existingEmailUser.id !== targetUserId) {
                throw new BadRequestException('Email is already in use');
            }

            user.email = dto.email;
        }

        if (dto.position) {

            if (currentUser.role !== 'ADMIN') {
                throw new ForbiddenException('Only admin can update position');
            }
            
            user.position = dto.position;
        }

        if (dto.name) user.name = dto.name;

        if (dto.phone) {
            const existingPhoneUser = await this.userRepo.findOne({
                where: { phone: dto.phone },
            });

            if (existingPhoneUser && existingPhoneUser.id !== targetUserId) {
                throw new BadRequestException('Phone number is already in use');
            }

            user.phone = dto.phone;
        }

        if (dto.photoUrl) user.photoUrl = dto.photoUrl;

        if (dto.oldPassword || dto.newPassword || dto.confirmPassword) {

            if (currentUser.role !== 'ADMIN') {
                if (!dto.oldPassword || !dto.newPassword || !dto.confirmPassword) {
                throw new BadRequestException('Incomplete password update fields');
                }

                const isMatch = await bcrypt.compare(dto.oldPassword, user.password);
                if (!isMatch) throw new BadRequestException('Old password is incorrect');

                if (dto.newPassword !== dto.confirmPassword) {
                throw new BadRequestException('New password and confirmation do not match');
                }
            }
            
            const salt = await bcrypt.genSalt();
            user.password = await bcrypt.hash(dto.newPassword, salt);
        }

        return this.userRepo.save(user);
    }
}
