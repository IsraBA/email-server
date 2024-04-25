const mongoose = require('mongoose');
require('./chat.model')

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
            color: {
                type: String,
                default: "#0000000",
            },
            title: {
                type: String,
                unique: true,
            },
        }]
    }],
    isActive: {
        type: Boolean,
        default: true,
    }
})

const userModel = mongoose.model('user', userSchema);

module.exports = userModel;
