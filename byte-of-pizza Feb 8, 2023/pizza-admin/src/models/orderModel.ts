const mongoose = require('mongoose')

const Schema = mongoose.Schema

const SelectSchema = new Schema({
    text: {
        type: {
            type: String,
            required: true
        },
        text: {
            type: String,
            required: true
        },
        emoji: {
            type: String,
            required: true
        }
    },
    value: {
        type: String,
        required: true
    }

})

const OrderSchema = new Schema({
    user: {
        id: {
            type: String,
            required: true
        },
        username: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        team_id: {
            type: String,
            required: true
        },
        img: {
            type: String,
            required: true
        },
    },
    orderInfo: {
        pizza_name: SelectSchema,
        pizza_size: SelectSchema,
        pizza_dough: SelectSchema,
        pizza_border: SelectSchema,
        pizza_additive: SelectSchema,
        pizza_address: {
            type: String,
            required: true
        },
        pizza_comment: {
            type: String,
            required: false
        }
    },
    status: {
        text: {
            type: String,
            required: false,
            default: 'Принято'
        },
        value: {
            type: String,
            required: false,
            default: 'accepted'
        }
    }

}, { timestamps: true })

const Order = mongoose.model('Order', OrderSchema);
export default Order;

