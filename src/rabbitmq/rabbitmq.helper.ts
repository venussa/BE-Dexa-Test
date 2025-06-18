import { Queue } from '@src/rabbitmq/queue.enum';
import { RabbitmqService } from '@src/rabbitmq/rabbitmq.service';

let rabbitmqServiceInstance: RabbitmqService;

export function registerRabbitmqHelper(service: RabbitmqService) {
    rabbitmqServiceInstance = service;
}

export async function sendLogging(payload: any) {
    if (!rabbitmqServiceInstance) {
        throw new Error('RabbitmqService is not registered. Call registerRabbitmqHelper() first.');
    }

    const client = await rabbitmqServiceInstance.getClient(Queue.LOGGING);
    const isConnected = (client as any)?.client;

    if (!isConnected) {
        await client.connect();
    }

    client.emit(Queue.LOGGING, payload);
}

export async function sendNotification(payload: any) {
    if (!rabbitmqServiceInstance) {
        throw new Error('RabbitmqService is not registered. Call registerRabbitmqHelper() first.');
    }

    const client = await rabbitmqServiceInstance.getClient(Queue.NOTIFICATION);
    const isConnected = (client as any)?.client;
    if (!isConnected) {
        await client.connect();
    }

    client.emit(Queue.NOTIFICATION, payload);
}
