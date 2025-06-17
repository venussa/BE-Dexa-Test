import { Module, OnModuleInit } from '@nestjs/common';
import { RabbitmqService } from './rabbitmq.service';
import { registerRabbitmqHelper } from './rabbitmq.helper';
import { Consumer } from './consumer';
import { LoggingModule } from '../logging/logging.module';

@Module({
  imports: [LoggingModule],
  controllers: [Consumer],
  providers: [RabbitmqService],
})

export class RabbitmqModule implements OnModuleInit {
  constructor(private readonly rabbitmqService: RabbitmqService) {}

  onModuleInit() {
    registerRabbitmqHelper(this.rabbitmqService);
  }
}