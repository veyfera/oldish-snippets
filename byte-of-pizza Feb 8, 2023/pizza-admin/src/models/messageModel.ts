const mongoose = require('mongoose')

const Schema = mongoose.Schema

const MessageSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    categoryId: {
        type: Number,
        required: true
    },
    mainImage: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    }
})

const Message = mongoose.model('Message', MessageSchema);
export default Message;

