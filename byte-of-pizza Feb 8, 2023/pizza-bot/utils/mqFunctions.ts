import amqplib from 'amqplib';
import './env';

export const sendMessageToDb = async (message: object) => {
  const q = 'pizza-orders';
  const conn = await amqplib.connect(process.env.RABBITMQ_URI);
  const ch = await conn.createChannel();
  await ch.assertQueue(q);
  const qm = JSON.stringify(message);
  return ch.sendToQueue(q, Buffer.from(qm, "utf-8"));
}


export const receiveMessageFromDb = async (app) => {
  const q = "pizza-status";
  const conn = await amqplib.connect(process.env.RABBITMQ_URI);
  const ch = await conn.createChannel();
  await ch.assertQueue(q);
  await ch.consume(q, async (msg: Message) => {
    console.log('Received order from MQ: ', msg.content.toString());
    const orderData = JSON.parse(msg.content.toString())
    await app.client.chat.postMessage({
      channel: orderData.user.id,
      text: `<@${orderData.user.id}> статус вашего заказа изменился на "${orderData.status.text}"`
    });
  }, { noAck: true });
}
