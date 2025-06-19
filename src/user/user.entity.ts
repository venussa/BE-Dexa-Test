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

    @Column({ type: 'text', nullable: true, default: null })
    address: string | null;

    @Column({ type: 'text', nullable: true, default: null })
    bio: string | null;

    @Column({ type: 'text', nullable: true, default: null })
    photoUrl: string | null;

    @Column()
    phone: string;

    @Column()
    password: string;

    @Column({ default: 'USER' })
    role: 'USER' | 'ADMIN';

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}