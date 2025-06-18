import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '@src/user/user.entity';

@Entity('attendance')
export class Attendance {
  
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User)
    user: User;

    @Column({ type: 'enum', enum: ['CHECKIN', 'CHECKOUT'] })
    type: 'CHECKIN' | 'CHECKOUT';

    @CreateDateColumn()
    timestamp: Date;
}