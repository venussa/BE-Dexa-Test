import { Module } from '@nestjs/common';
import { UserController } from '@src/user/user.controller';
import { UserService } from '@src/user/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@src/user/user.entity';
import { Attendance } from '@src/attendance/attendance.entity';
import { RabbitmqService } from '@src/rabbitmq/rabbitmq.service';
import { RabbitmqModule } from '@src/rabbitmq/rabbitmq.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, Attendance]),
        RabbitmqModule,
    ],
    controllers: [UserController],
    providers: [UserService, RabbitmqService]
})

export class UserModule {}
