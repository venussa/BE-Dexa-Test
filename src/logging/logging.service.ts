import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logging } from '@src/logging/logging.entity';

@Injectable()
export class LoggingService {
    constructor(
        @InjectRepository(Logging, process.env.LOG_DB_NAME)
        private loggingRepo: Repository<Logging>
    ) {}

    async saveLog(data: any) {
        const logData = {
            userId: data.id,
            action: data.action,
            before: data.before,
            after: data.after,
            createdAt: new Date,
        };

        return this.loggingRepo.save(logData);
    }
}