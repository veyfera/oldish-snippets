"use strict";
require('dotenv').config();
//import express from "express";
const express = require('express');
const mongoose = require('mongoose');
const messageRoutes = require('./routes/messages');
const app = express();
app.use(express.json());
//routes
//
app.use('/api/messages', messageRoutes);
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
    app.listen(process.env.PORT, () => {
        console.log(`API started on port ${process.env.PORT}`);
    });
});
mongoose.set('strictQuery', false);
