import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from '@src/app.module';
import { Transport } from '@nestjs/microservices';
import { Queue } from '@src/rabbitmq/queue.enum';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const rabbitMqUrl = `amqp://${process.env.RABBITMQ_USERNAME}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}`;

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: "*",
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      transform: true,
    }),
  );

  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitMqUrl],
      queue: Queue.LOGGING,
      queueOptions: {
        durable: true,
      },
      noAck: false,
    },
  });

  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitMqUrl],
      queue: Queue.NOTIFICATION,
      queueOptions: {
        durable: true,
      },
      noAck: false,
    },
  });

  await app.startAllMicroservices();
  
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
