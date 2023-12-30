import express from "express";

export const router = express.Router()

import { getAllMessages } from "../controllers/messageController";

router.get('/', getAllMessages)

module.exports = router
