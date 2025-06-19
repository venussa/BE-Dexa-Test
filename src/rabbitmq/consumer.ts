import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { Queue } from '@src/rabbitmq/queue.enum';
import { LoggingService } from '@src/logging/logging.service';
import { FcmService } from '@src/fcm/fcm.service';

@Controller()
export class Consumer {
    private readonly logger = new Logger(Consumer.name);
    private readonly MAX_RETRIES = 5;

    constructor(
        private loggingService: LoggingService,
        private fcmService: FcmService
    ) {}

    @EventPattern(Queue.LOGGING)
    async handleLogging(@Payload() data: any, @Ctx() context: RmqContext) {
        const channel = context.getChannelRef();
        const originalMsg = context.getMessage();
        const retries = originalMsg.properties.headers['x-retries'] || 0;

        try {
            await this.processMessage(data, Queue.LOGGING);
            channel.ack(originalMsg);
        } catch (err) {

            this.logger.error(`Failed to process message. Retry #${retries}. Error: ${err.message}`);

            if (retries < this.MAX_RETRIES) {

                const newHeaders = {
                    ...originalMsg.properties.headers,
                    'x-retries': retries + 1,
                };

                channel.sendToQueue(
                    originalMsg.fields.routingKey,
                    originalMsg.content,
                    {
                        headers: newHeaders,
                        persistent: true,
                    },
                );

                channel.ack(originalMsg);
            } else {
                this.logger.warn(`Max retries reached (${this.MAX_RETRIES}). Dropping message.`);
                channel.ack(originalMsg);
            }
        }
    }

    @EventPattern(Queue.NOTIFICATION)
    async handleNotification(@Payload() data: any, @Ctx() context: RmqContext) {
        const channel = context.getChannelRef();
        const originalMsg = context.getMessage();
        const retries = originalMsg.properties.headers['x-retries'] || 0;

        try {
            await this.processMessage(data, Queue.NOTIFICATION);
            channel.ack(originalMsg);
        } catch (err) {

            this.logger.error(`Failed to process message. Retry #${retries}. Error: ${err.message}`);

            if (retries < this.MAX_RETRIES) {

                const newHeaders = {
                    ...originalMsg.properties.headers,
                    'x-retries': retries + 1,
                };

                channel.sendToQueue(
                    originalMsg.fields.routingKey,
                    originalMsg.content,
                    {
                        headers: newHeaders,
                        persistent: true,
                    },
                );

                channel.ack(originalMsg);
            } else {
                this.logger.warn(`Max retries reached (${this.MAX_RETRIES}). Dropping message.`);
                channel.ack(originalMsg);
            }
        }
    }

    async processMessage(data: any, type: string) {
        if (type === Queue.LOGGING) {
            return this.loggingService.saveLog(data);
        } else {
            const saved = this.fcmService.sendNotificationToToken(
                data?.fcmToken,
                "Notification",
                `A user with the email address ${data.email} has updated their personal information.`
            );

            return saved;
        }
    }
}