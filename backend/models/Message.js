const mongoose = require('mongoose');


const MessageSchema = mongoose.Schema({
    text: {
        type: String,
        required: true,

    },
    datetime:{
        type: Date,
        default: Date.now()
    },

    username: {
        type: String
    }
});
const Message = mongoose.model('Message',MessageSchema);
module.exports = Message;