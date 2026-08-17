import amqplib from "amqplib";

const QUEUE = "auth_notification_queue";

const connectionRabbitMQ = await amqplib.connect(process.env.RABBITMQ_URL);

const channel = await connectionRabbitMQ.createChannel();

channel.assertQueue(QUEUE, { durable: true });

export const sendAuthNotification = async (message) => {
    channel.sendToQueue(QUEUE, Buffer.from(JSON.stringify(message)), { persistent: true });
}
