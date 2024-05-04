const mongoose = require('mongoose');
require('./user.model')

const messageSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
    },
    content: String,
    from: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "user",
        required: true,
    },
})

const chatSchema = new mongoose.Schema({
    subject: {
        type: String,
        required: true
    },
    messages: [messageSchema],
    members: [{
        type: mongoose.SchemaTypes.ObjectId,
        ref: "user",
    }],
    lastDate: Date
})

const chatModel = mongoose.model('chat', chatSchema);

module.exports = chatModel;