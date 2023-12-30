const mongoose = require('mongoose')
const amqplib = require('amqplib');

import { Request, Response } from "express";
import Order from "../models/orderModel";

import { Message } from "amqplib";


export const getAllOrders = async (req:Request, res:Response) => {
    const orders = await Order.find({});

    res.status(200).json(orders);
}

export const patchOrderStatus = async (req:Request, res:Response) => {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({error: 'Заказа с таким номером нет'})
    }

    const order = await Order.findOneAndUpdate({_id: id}, { $set: {status: req.body.status}}, {new:true})

    if (!order) {
    return res.status(400).json({error: 'Заказа с таким номером нет'})
    }

    sendUpdatedStatus(order)
    res.status(200).json(order)
}

export const receiveOrders = async () => {
    const q = "pizza-orders";
    const conn = await amqplib.connect(process.env.RABBITMQ_URI);
    const ch = await conn.createChannel();
    await ch.assertQueue(q);
    await ch.consume(q, async (msg:Message) => {
        await createOrder(msg.content.toString());
    }, {noAck: true});
}

const createOrder = async (data:string) => {
    try {
        const dataObj = await JSON.parse(data);
        const order = await Order.create(dataObj);
    } catch (error:any) {
        console.log("An error occurred: ", error.message)
    }
}

export const sendUpdatedStatus = async (order: typeof Order) => {
    const q = 'pizza-status';
    const conn = await amqplib.connect(process.env.RABBITMQ_URI);
    const ch = await conn.createChannel();
    await ch.assertQueue(q);
    const qm = JSON.stringify(order);
    ch.sendToQueue(q, Buffer.from(qm, "utf-8"));
}

