import { Request, Response } from "express";
import Message from "../models/messageModel";


export const getAllMessages = async (req:Request, res:Response) => {
    const messages = await Message.find({})

    res.status(200).json(messages)
}

