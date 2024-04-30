const { mongo } = require('mongoose');
const userModel = require('../models/user.model');

const getUsers = async (filter = {}, proj) => {
    return await userModel.find({ ...filter, isActive: true }, proj);
}

const getUser = async (filter = {}, selectPassword = false) => {
    let query = userModel.findOne({ ...filter, isActive: true });
    if (selectPassword) {
        query = query.select('+password');
    }
    let data = await query.exec();
    return data;
}

async function save(user) {
    return await user.save()
}

async function readByFlags(id, flags = [], populate = {}) {

    let data = await userModel.findOne({ _id: id, isActive: true });
    data.chats = data.chats.filter(chat => flags.every(flag => {
        if (flag !== "isDeleted" && !chat.isDeleted) {
            if (typeof flag === 'object') {
                let [[k, v]] = Object.entries(flag)
                return chat[k] == v;
            }
            return chat[flag]
        } else if (flag === "isDeleted") {
            return chat.isDeleted
        } else {
            return false;
        }
    }))
    if (populate.chats) data = await data.populate('chats.chat')
    if (populate.users) data = await data.populate({ path: 'chats.chat.members', select: "userName image" })

    return data.toObject()
}

async function readByLabel(id, labelTitle) {
    let data = await userModel.findOne({ _id: id, isActive: true });
    data.chats = data.chats.filter(chat => chat.labels.includes(labelTitle));
    data = await data.populate('chats.chat')
    data = await data.populate({ path: 'chats.chat.members', select: "userName image" })

    return data.toObject()
}


const updateUser = async (id, data) => {
    return await userModel.findByIdAndUpdate(id, data);
};

const createUser = async (data) => {
    return await userModel.create(data);
};

const deleteUser = async (id) => {
    return await userModel.findByIdAndUpdate({ _id: id }, { isActive: false });
};

// const searchChat = async (chats ,input) => {
//     console.log('chats: ', chats)
//     const regex = new RegExp(input, 'i'); // 'i' for case-insensitive search
//     const results = await chats.find({
//         $or: [
//             { 'chat.subject': { $regex: regex } },
//             { 'chat.members.userName': { $regex: regex } },
//             { 'chat.messages.content': { $regex: regex } }
//         ]
//     });
//     return results;
// };


module.exports = {
    getUsers,
    getUser,
    updateUser,
    createUser,
    deleteUser,
    readByFlags,
    save,
    readByLabel
};