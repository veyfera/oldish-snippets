import express from "express";

import { loginUser, signupUser } from '../controllers/userController';

const router = express.Router()

// login route
router.post('/login', loginUser)
router.post('/signup', signupUser)

module.exports = router



