"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
//const express = require('express')
const express_1 = __importDefault(require("express"));
exports.router = express_1.default.Router();
//const getAllMessages = require('../controllers/messageController')
const messageController_1 = require("../controllers/messageController");
exports.router.get('/', messageController_1.getAllMessages);
module.exports = exports.router;
