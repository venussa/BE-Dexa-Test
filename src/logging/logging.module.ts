import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Logging } from '@src/logging/logging.entity';
import { LoggingService } from '@src/logging/logging.service';

@Module({
    imports: [TypeOrmModule.forFeature([Logging], process.env.LOG_DB_NAME)],
    providers: [LoggingService],
    exports: [LoggingService, TypeOrmModule],
})

export class LoggingModule {}
