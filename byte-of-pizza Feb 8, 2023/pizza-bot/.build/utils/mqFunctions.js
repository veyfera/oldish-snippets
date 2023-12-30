"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var mqFunctions_exports = {};
__export(mqFunctions_exports, {
  receiveMessageFromDb: () => receiveMessageFromDb,
  sendMessageToDb: () => sendMessageToDb
});
module.exports = __toCommonJS(mqFunctions_exports);
var import_amqplib = __toESM(require("amqplib"));
var import_env = require("./env");
const sendMessageToDb = async (message) => {
  const q = "pizza-orders";
  const conn = await import_amqplib.default.connect(process.env.RABBITMQ_URI);
  const ch = await conn.createChannel();
  await ch.assertQueue(q);
  const qm = JSON.stringify(message);
  return ch.sendToQueue(q, Buffer.from(qm, "utf-8"));
};
const receiveMessageFromDb = async (app) => {
  const q = "pizza-status";
  const conn = await import_amqplib.default.connect(process.env.RABBITMQ_URI);
  const ch = await conn.createChannel();
  await ch.assertQueue(q);
  await ch.consume(q, async (msg) => {
    console.log("Received order from MQ: ", msg.content.toString());
    const orderData = JSON.parse(msg.content.toString());
    await app.client.chat.postMessage({
      channel: orderData.user.id,
      text: `<@${orderData.user.id}> \u0441\u0442\u0430\u0442\u0443\u0441 \u0432\u0430\u0448\u0435\u0433\u043E \u0437\u0430\u043A\u0430\u0437\u0430 \u0438\u0437\u043C\u0435\u043D\u0438\u043B\u0441\u044F \u043D\u0430 "${orderData.status.text}"`
    });
  }, { noAck: true });
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  receiveMessageFromDb,
  sendMessageToDb
});
//# sourceMappingURL=mqFunctions.js.map
