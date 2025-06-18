import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('user')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column()
    name: string;

    @Column()
    position: string;

    @Column()
    phone: string;

    @Column()
    photoUrl: string;

    @Column()
    password: string;

    @Column({ default: 'USER' })
    role: 'USER' | 'ADMIN';

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}