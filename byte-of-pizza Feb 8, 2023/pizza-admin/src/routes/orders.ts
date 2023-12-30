import express from "express";

export const router = express.Router()

import { getAllOrders, patchOrderStatus } from "../controllers/orderController";
import { requireAuth } from "../middleware/requireAuth"

router.use(requireAuth)

router.get('/', getAllOrders)

router.patch('/:id', patchOrderStatus)

module.exports = router
