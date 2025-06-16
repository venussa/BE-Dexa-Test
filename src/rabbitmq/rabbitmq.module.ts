import { Module, OnModuleInit } from '@nestjs/common';
import { RabbitmqService } from './rabbitmq.service';
import { registerRabbitmqHelper } from './rabbitmq.helper';

@Module({
  providers: [RabbitmqService],
  exports: [RabbitmqService],
})


export class RabbitmqModule implements OnModuleInit {
  constructor(private readonly rabbitmqService: RabbitmqService) {}

  onModuleInit() {
    registerRabbitmqHelper(this.rabbitmqService);
  }
}