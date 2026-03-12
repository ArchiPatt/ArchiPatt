import amqp, { Channel, ChannelModel } from "amqplib";
import { env } from "../env";

export const QUEUE_NAME = "core.account_operations";

let connection: ChannelModel | null = null;
let channel: Channel | null = null;

export async function getChannel(): Promise<Channel> {
  if (channel && connection) return channel;
  connection = await amqp.connect(env.rabbitmq.url);
  channel = await connection.createChannel();
  await channel.assertQueue(QUEUE_NAME, { durable: true });
  connection.on("error", (err: Error) => {
    connection = null;
    channel = null;
    console.error("RabbitMQ connection error", err);
  });
  connection.connection.on("close", () => {
    connection = null;
    channel = null;
  });
  return channel;
}

export async function closeConnection(): Promise<void> {
  if (channel) {
    await channel.close().catch(() => {});
    channel = null;
  }
  if (connection) {
    await connection.close().catch(() => {});
    connection = null;
  }
}
