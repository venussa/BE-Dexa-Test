import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { Queue } from './queue.enum';

@Injectable()
export class RabbitmqService implements OnModuleDestroy {
  private clients: Map<string, ClientProxy> = new Map();

  private createClient(queue: string): ClientProxy {
    const rabbitMqUrl = `amqp://${process.env.RABBITMQ_USERNAME}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}`;
    return ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [rabbitMqUrl],
        queue,
        queueOptions: {
          durable: true,
        },
      },
    });
  }

  getClient(queue: Queue): ClientProxy {
    if (!this.clients.has(queue)) {
      const client = this.createClient(queue);
      this.clients.set(queue, client);
    }
    return this.clients.get(queue)!;
  }

  async onModuleDestroy() {
    for (const client of this.clients.values()) {
      await client.close();
    }
  }
}