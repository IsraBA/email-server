const chatModel = require('../models/chat.model');

const getChats = async (filter = {}) => {
    return await chatModel.find((filter));
}

const getChat = async (filter = {}) => {
    return await chatModel.findOne(filter);
}

const updateChat = async (id, data) => {
    return await chatModel.findByIdAndUpdate({ _id: id }, { $set: data });
};

async function save(chat) {
    return await chat.save()
}

const createChat = async (data) => {
    return await chatModel.create(data);
};

const deleteChat = async (id) => {
    return await chatModel.deleteOne({ _id: id });
};

module.exports = { getChats, getChat, updateChat, createChat, deleteChat, save };