const mongoose = require('mongoose');
require('./chat.model')

const labelSchema = new mongoose.Schema({
    color: {
        type: String,
        default: "#000000",
    },
    title: {
        type: String,
        unique: true,
    },
});

const labelModel = mongoose.model('label', labelSchema);

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        select: false,
        required: true
    },
    image: String,
    labels: [labelSchema],
    chats: [{
        chat: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "chat",
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        isInbox: Boolean,
        isSent: Boolean,
        isFavorite: Boolean,
        isDraft: Boolean,
        isDeleted: Boolean,
        labels: [{
            type: mongoose.SchemaTypes.ObjectId,
            ref: "label",
        }]
    }],
    isActive: {
        type: Boolean,
        default: true,
    }
})

const userModel = mongoose.model('user', userSchema);

module.exports = userModel;
