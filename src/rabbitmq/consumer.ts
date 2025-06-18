import { Controller, Logger } from '@nestjs/common';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { Queue } from '@src/rabbitmq/queue.enum';
import { LoggingService } from '@src/logging/logging.service';

@Controller()
export class Consumer {
    private readonly logger = new Logger(Consumer.name);
    private readonly MAX_RETRIES = 5;

    constructor(private loggingService: LoggingService) {}

    @EventPattern(Queue.LOGGING)
    async handleLogging(@Payload() data: any, @Ctx() context: RmqContext) {
        const channel = context.getChannelRef();
        const originalMsg = context.getMessage();
        const retries = originalMsg.properties.headers['x-retries'] || 0;

        try {
            await this.processMessage(data);
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

    async processMessage(data: any) {
        return this.loggingService.saveLog(data);
    }
}