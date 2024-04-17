const { Flags } = require('../utility');
const users = require('../DL/controllers/user.controller');
const chats = require('../DL/controllers/chat.controller');

// קבלת הצ'אטים של המשתמש על פי קטגוריה
async function getChatsByFilter(userId, filter) {
    if (!Flags[filter]) throw { code: 404, msg: 'box not found' };
    const { chats } = await users.readByFlags(userId, [Flags[filter]], { chats: true, users: true });
    return chats;
}

async function getSingleChat(userId, chatId) {
    let user = await users.getUser({ _id: userId });
    if (!user) throw { code: 404, msg: 'user not found' };
    user.chats = [user.chats.find(c => c._id == chatId)];
    // console.log('chatId: ', chatId)
    // console.log('user.chats: ', user.chats)
    if (!user.chats[0]) throw { code: 404, msg: 'chat not found' };
    await user.populate('chats.chat');
    await user.populate({ path: 'chats.chat.members', select: "_id userName email image" });
    await user.populate({ path: 'chats.chat.messages.from', select: "_id userName email image" });
    return user.chats[0];
}

async function updateReadChat(userId, chatId) {
    let user = await users.getUser({ _id: userId });
    if (!user) throw { code: 404, msg: 'user not found' };
    user.chats.find(c => c._id == chatId).isRead = true;
    users.save(user);
    return "chat marked as read"
}

let exampleData = {
    subject: "third try",
    messages: [{
        date: "2024-04-10T10:24:00.000Z",
        content: "Hello, how are you? This is the message from the channel",
        from: "66128823d5cbfbbc8fa1ab14"
    }],
    lastDate: "2024-03-21T10:24:00.000Z",
    members: [
        "user2@example.com",
        "user1@example.com",
        "user3@example.com",
        "user4@example.com",
    ]
}

// createNewChat('66128823d5cbfbbc8fa1ab14', exampleData)

async function createNewChat(userId, data) {

    let user = await users.getUser({ _id: userId });
    if (!user) throw { code: 404, msg: 'user not found' };

    // סינון מיילים כפולים במידה ושלח גם לעצמו
    data.members = JSON.parse(data.members);
    data.members = Array.from(new Set(data.members.map(JSON.stringify))).map(JSON.parse);

    // יצירת מערך אי די במקום מערך האימיילים
    data.members = await Promise.all(data.members.map(email => emailToId(email)));

    data.messages = JSON.parse(data.messages);

    let newChat = await chats.createChat(data);

    // console.log('data.messages: ', data.messages)
    // console.log('newChat: ', newChat)

    // עדכון של כל המשתתפים בשיחה בשיחה החדשה
    data.members.forEach(async memberId => {
        await users.updateUser({ _id: memberId }, {
            $push: {
                chats: {
                    chat: newChat._id,
                    isRead: memberId == userId,
                    isInbox: 
                        memberId != userId || 
                        (memberId == userId && data.members.length == 1)
                    ,
                    isSent: memberId == userId,
                    isFavorite: false,
                    isDraft: false,
                    isDeleted: false,
                    labels: []
                }
            }
        })
    })

    console.log("updated successfully")
    return newChat;
}

async function emailToId(email) {
    let user = await users.getUser({ email: email.email })
    if (!user) throw { code: 404, msg: 'user not found' };
    return user._id;
};

async function addMsgToChat(chatId, newMsg) {
    let chat = await chats.getChat({ _id: chatId });
    console.log('chat: ', chat)
    if (!chat) throw { code: 404, msg: 'chat not found' };

    let updateChat = [...chat.messages, newMsg];

    await chats.updateChat(chatId, { messages: updateChat, lastDate: newMsg.date })

    return chat;
}

async function deleteChat(userId, chatId) {
    let user = await users.getUser({ _id: userId });
    if (!user) throw { code: 404, msg: 'user not found' };
    let chat = user.chats.find(c => c._id == chatId);
    chat.isDeleted = true;
    users.save(user);
    return user;
};

async function deleteChatForever(userId, chatId) {
    let user = await users.getUser({ _id: userId });
    if (!user) throw { code: 404, msg: 'user not found' };
    let chat = user.chats.find(c => c._id == chatId);
    user.chats.remove(chat);
    users.save(user);
    return chat;
};

module.exports = {
    getChatsByFilter,
    getSingleChat,
    updateReadChat,
    createNewChat,
    deleteChat,
    deleteChatForever,
    addMsgToChat
}