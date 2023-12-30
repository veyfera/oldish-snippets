/* eslint-disable no-console */
/* eslint-disable import/no-internal-modules */
import './utils/env';
import { App, LogLevel } from '@slack/bolt';

import { messageForm } from './utils/form';
import { receiveMessageFromDb, sendMessageToDb } from './utils/mqFunctions';
import { formatOrder } from './utils/formatFunctions';

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  port: process.env.PORT || 3000,
  logLevel: LogLevel.DEBUG,
});

app.use(async ({ next }) => {
  await next();
});

// Listens to incoming messages that contain "hello"
app.message('pizza', async ({ message, say }) => {
  // Filter out message events with subtypes (see https://api.slack.com/events/message)
  if (message.subtype === undefined || message.subtype === 'bot_message') {
    // say() sends a message to the channel where the event was triggered
    await say({
      blocks: messageForm,
      text: `Hey there <@${message.user}>!`,
    });
  }
});

app.action('pizza_order-action', async ({ body, ack, say }) => {
  // Acknowledge the action
  await ack();

  const formatedOrder = formatOrder(body);
  sendMessageToDb(formatedOrder);
  await say(`<@${body.user.id}> заказ принят, следите за изменением статуса заказа...`);
});

(async () => {
  // Start your app
  await app.start(Number(process.env.PORT) || 3000);
  receiveMessageFromDb(app);

  console.log('⚡️ Bolt app is running!');
})();