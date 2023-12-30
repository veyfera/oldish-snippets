"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require('mongoose');
mongoose.set('strictQuery', false);
const Schema = mongoose.Schema;
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
});
//module.exports = mongoose.model('Message', MessageSchema)
const Message = mongoose.model('Message', MessageSchema);
exports.default = Message;
//export interface IUser extends mongoose.Document {
//name: string; 
//somethingElse?: number; 
//};
//export const UserSchema = new mongoose.Schema({
//name: {type:String, required: true},
//somethingElse: Number,
//});
//const User = mongoose.model<IUser>('User', UserSchema);
//export default User;
