import { Module, OnModuleInit } from '@nestjs/common';
import { RabbitmqService } from '@src/rabbitmq/rabbitmq.service';
import { registerRabbitmqHelper } from '@src/rabbitmq/rabbitmq.helper';
import { Consumer } from '@src/rabbitmq/consumer';
import { LoggingModule } from '@src/logging/logging.module';
import { FcmModule } from '@src/fcm/fcm.module';
import { FcmService } from '@src/fcm/fcm.service';

@Module({
    imports: [LoggingModule, FcmModule],
    controllers: [Consumer],
    providers: [RabbitmqService, FcmService],
})

export class RabbitmqModule implements OnModuleInit {
    constructor(private readonly rabbitmqService: RabbitmqService) {}

    onModuleInit() {
        registerRabbitmqHelper(this.rabbitmqService);
    }
}