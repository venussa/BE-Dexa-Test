import * as bcrypt from 'bcrypt';
import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { format, startOfDay, endOfDay } from 'date-fns';
import { User } from '@src/user/user.entity';
import { Attendance } from '@src/attendance/attendance.entity';
import { UpdateUserDto } from '@src/user/dto/update-user.dto';
import { CreateUserDto } from '@src/user/dto/create-user.dto';
import { sendLogging, sendNotification } from '@src/rabbitmq/rabbitmq.helper';

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
        const oldData = user;
        
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
        if (dto.address) user.address = dto.address;
        if (dto.bio) user.bio = dto.bio;

        if (dto.oldPassword || dto.newPassword || dto.confirmPassword) {

            if (currentUser.role !== 'ADMIN' || (currentUser.role === 'ADMIN' && currentUser.id === targetUserId)) {
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

        const saved = await this.userRepo.save(user);

        const activity = {
            id: user.id,
            email: user.email,
            fcmToken: user.fcmToken,
            action: 'UPDATE',
            before: oldData,
            after: saved,
        };

      sendLogging(activity);

      if (currentUser.role !== 'ADMIN') {
        sendNotification(activity);
      }

      return saved;
    }

    async createUser(dto: CreateUserDto) {

        const emailExists = await this.userRepo.findOne({ where: { email: dto.email } });
        if (emailExists) throw new BadRequestException('Email is already in use');

        const phoneExists = await this.userRepo.findOne({ where: { phone: dto.phone } });
        if (phoneExists) throw new BadRequestException('Phone number is already in use');

        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(dto.password, salt);

        const user = this.userRepo.create({
            ...dto,
            password: hashedPassword,
            role: 'USER',
        });

        return this.userRepo.save(user);
    }

    async deleteUser(currentUser: User, targetUserId: string) {
        if (currentUser.id === targetUserId) {
            throw new ForbiddenException('You cannot delete your own account');
        }

        const user = await this.userRepo.findOne({ where: { id: targetUserId } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        await this.userRepo.remove(user);

        return { message: 'User deleted successfully' };
    }

    async getAllUsers(query: any) {
        const page = Number(query.page) || 1;
        const perPage = Number(query.perPage) || 10;
        const name = query.name?.toLowerCase();
        const id = query.userId;

        const skip = (page - 1) * perPage;
        const where: any = {};

        if (id) {
            where.id = id;
        }

        const qb = this.userRepo.createQueryBuilder('user')
            .select([
                'user.id',
                'user.email',
                'user.name',
                'user.role',
                'user.phone',
                'user.position',
                'user.photoUrl',
                'user.address',
                'user.bio',
            ])
            .orderBy('user.createdAt', 'DESC')
            .skip(skip)
            .take(perPage)

        if (id) {
            qb.andWhere('user.id = :id', { id });
        }

        if (name) {
            qb.where('LOWER(user.name) LIKE :name', { name: `%${name}%` });
        }

        const [data, total] = await qb.getManyAndCount();

        return {
            currentPage: page,
            perPage,
            total,
            data,
        };
    }

    async saveDeviceToken(userId: string, token: string) {
        const user = await this.userRepo.findOneBy({ id: userId });
        if (!user) throw new NotFoundException("User not found");

        user.fcmToken = token;
        await this.userRepo.save(user);
        
        return true;
    }
}
