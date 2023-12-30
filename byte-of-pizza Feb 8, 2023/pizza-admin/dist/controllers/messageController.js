"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllMessages = void 0;
const messageModel_1 = __importDefault(require("../models/messageModel"));
const getAllMessages = async (req, res) => {
    const messages = await messageModel_1.default.find({});
    res.status(200).json(messages);
};
exports.getAllMessages = getAllMessages;
//module.exports = getAllMessages
