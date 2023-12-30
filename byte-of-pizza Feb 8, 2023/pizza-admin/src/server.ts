require('dotenv').config();

const express = require('express');

const mongoose = require('mongoose');

const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/user');

import { receiveOrders} from "./controllers/orderController";

mongoose.set('strictQuery', false);

const app = express()
app.use(express.json())


//routes

app.use('/api/orders', orderRoutes)
app.use('/api/user', userRoutes)


mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log(`API started on port ${process.env.PORT}`)
            receiveOrders();
        })
    })

