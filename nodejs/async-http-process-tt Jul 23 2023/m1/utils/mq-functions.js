import amqplib from 'amqplib';
import './env.js';
import { logger } from './logger.js';

const conn = await amqplib.connect(process.env.RABBITMQ_URI);

async function initializeMq() {
    const queues = ["tasks", "results"];
    const channel = await conn.createChannel();

    queues.forEach(async (q) => channel.assertQueue(q))

    return channel;
}

export async function sendMessageToMq(msg) {
    try {
        const channel = await conn.createChannel();
        const qm = JSON.stringify(msg);

        logger.info('Sent task to MQ: ', msg);
        await channel.sendToQueue('tasks', Buffer.from(qm, "utf-8"));

        channel.close();
    } catch (error) {
        logger.error('Error handler in sendMessageToMq', { error, msg });
    }
}

export async function listenMq(handler) {
    const channel = await initializeMq();
    const queue = 'results';
    logger.info(`Start consuming ${queue} queue`);

    await channel.consume(queue, async (msg) => {
        logger.info('Received result from MQ: ', msg.content.toString());
        const data = JSON.parse(msg.content.toString());

        try {
            handler(data);
        } catch (error) {
            logger.error('Error happened in results handler', { error, data });
        }
    }, { noAck: true });
}
