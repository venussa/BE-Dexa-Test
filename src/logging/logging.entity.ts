import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('logging')
export class Logging {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Index()
    @Column()
    userId: string;

    @Column()
    action: string;

    @Column({ type: 'jsonb', nullable: true })
    before?: any;

    @Column({ type: 'jsonb', nullable: true })
    after?: any;

    @CreateDateColumn()
    createdAt: Date;
}