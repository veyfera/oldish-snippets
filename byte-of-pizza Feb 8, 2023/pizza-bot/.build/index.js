"use strict";
var import_env = require("./utils/env");
var import_bolt = require("@slack/bolt");
var import_form = require("./utils/form");
var import_mqFunctions = require("./utils/mqFunctions");
var import_formatFunctions = require("./utils/formatFunctions");
const app = new import_bolt.App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  port: process.env.PORT || 3e3,
  logLevel: import_bolt.LogLevel.DEBUG
});
app.use(async ({ next }) => {
  await next();
});
app.message("pizza", async ({ message, say }) => {
  if (message.subtype === void 0 || message.subtype === "bot_message") {
    await say({
      blocks: import_form.messageForm,
      text: `Hey there <@${message.user}>!`
    });
  }
});
app.action("pizza_order-action", async ({ body, ack, say }) => {
  await ack();
  const formatedOrder = (0, import_formatFunctions.formatOrder)(body);
  (0, import_mqFunctions.sendMessageToDb)(formatedOrder);
  await say(`<@${body.user.id}> \u0437\u0430\u043A\u0430\u0437 \u043F\u0440\u0438\u043D\u044F\u0442, \u0441\u043B\u0435\u0434\u0438\u0442\u0435 \u0437\u0430 \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u0435\u043C \u0441\u0442\u0430\u0442\u0443\u0441\u0430 \u0437\u0430\u043A\u0430\u0437\u0430...`);
});
(async () => {
  await app.start(Number(process.env.PORT) || 3e3);
  (0, import_mqFunctions.receiveMessageFromDb)(app);
  console.log("\u26A1\uFE0F Bolt app is running!");
})();
//# sourceMappingURL=index.js.map
