const jwt = require('jsonwebtoken')
import User from '../models/userModel'
import { Request, Response, NextFunction } from "express";

export const requireAuth = async (req:Request, res:Response, next:NextFunction) => {
    const { authorization } = req.headers

    if (!authorization) {
        return res.status(401).json({error: 'Требуется токен авторизации'})
    }

    try {
        const { _id } = jwt.verify(authorization, process.env.SECRET)

        req.user = await User.findOne({ _id }).select('_id')
        next()
    } catch (error:any) {
        res.status(401).json({error: 'Запрос не разрешен'})
    }
}
