import { Request, Response } from "express";
import User from "../models/userModel";
const jwt = require('jsonwebtoken')


const createToken = (_id:string) => {
    return jwt.sign({_id}, process.env.SECRET, { expiresIn: '3d' })
}

export const signupUser = async (req:Request, res:Response) => {
  const {username, password} = req.body

  try {
    const user = await User.signup(username, password)

    const token = createToken(user._id)

    res.status(200).json({username, token})
  } catch (error:any) {
    res.status(400).json({error: error.message})
  }
}

export const loginUser = async (req:Request, res:Response) => {
    const {username, password} = req.body

    try {
        const user = await User.login(username, password)

        const token = createToken(user._id)

        res.status(200).json({username, token})
    } catch (error:any) {
        res.status(400).json({error: error.message})
    }
}

