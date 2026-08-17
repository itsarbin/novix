import amqplib from "amqplib";

const QUEUE = "auth_notification_queue";

const connectionRabbitMQ = await amqplib.connect(process.env.RABBITMQ_URL);

const channel = await connectionRabbitMQ.createChannel();

channel.assertQueue(QUEUE, { durable: true });

export default channel
