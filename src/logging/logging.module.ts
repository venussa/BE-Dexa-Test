import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Logging } from '../logging/logging.entity';
import { LoggingService } from '../logging/logging.service';

@Module({
  imports: [TypeOrmModule.forFeature([Logging], process.env.LOG_DB_NAME)],
  providers: [LoggingService],
  exports: [LoggingService, TypeOrmModule],
})

export class LoggingModule {}
