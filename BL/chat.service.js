const { Flags } = require('../utility');
const users = require('../DL/controllers/user.controller');
const chats = require('../DL/controllers/chat.controller');
const htmlToPlainText = require('../function/htmlToText');

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

async function updateChat(userId, chatId, update = [String, Boolean]) {
    let user = await users.getUser({ _id: userId });
    if (!user) throw { code: 404, msg: 'user not found' };

    let flag = Flags[update[0]];
    if (!flag) throw { code: 404, msg: 'flag not found' };

    let chat = user.chats.find(c => c._id == chatId)
    chat[flag] = update[1];

    await users.save(user);
    return "chat updated"
}

// הוספת תגית לצ'אט
async function addLabelToChat(userId, chatId, label) {
    let user = await users.getUser({ _id: userId });
    if (!user) throw { code: 404, msg: 'user not found' };

    // בדיקה אם התווית קיימת במערך התוויות
    let existingLabel = user.labels.find(l => l.title === label.title);
    let labelId;

    if (existingLabel) {
        labelId = existingLabel._id;
    } else {
        // אם לא קיים מוסיף אותה למערך התוויות
        user.labels.push(label);
        await users.save(user);
        labelId = user.labels.find(l => l.title === label.title)?._id;
    }

    // מוסיף את האי-די שלה למערך התוויות של הצ'אט המבוקש
    let chat = user.chats.find(c => c._id.toString() === chatId);
    if (!chat) throw { code: 404, msg: 'chat not found' };

    // אם התווית לא קיימת המערך התוויות של הצ'אט מוסיף אותה
    if (!chat.labels.includes(labelId)) {
        chat.labels.push(labelId);
        await users.save(user);
    }
    console.log("labelId: ", labelId)
    
    user = await users.getUser({ _id: userId });
    if (!user) throw { code: 404, msg: 'user not found' };

    chat = user.chats.find(c => c._id.toString() === chatId);
    
    console.log("chat: ", chat)

    return chat.labels;

}

// addLabelToChat("66168d588eea0054ac8a279c", "66204f9cfe7492419792ad46", { color: "#000000", title: "test8" })
//     .catch(console.log)

// הסרת תגית מצ'אט
async function removeLabelFromChat(userId, chatId, labelTitle) {
    let user = await users.getUser({ _id: userId });
    if (!user) throw { code: 404, msg: 'user not found' };

    let chat = user.chats.find(c => c._id == chatId);

    chat.labels = chat.labels.filter(l => l.title != labelTitle);

    await users.save(user);
    return chat.labels;
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
                    isRead: memberId == userId && data.members.length != 1,
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
    // console.log('chat: ', chat)
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

// קבלת כמות ההודעות שלא נקראו בכל תיבה
async function getUnreadChats(userId) {
    let user = await users.getUser({ _id: userId });
    if (!user) throw { code: 404, msg: 'user not found' };

    let unReadObj = {
        inbox: 0,
        favorite: 0,
        deleted: 0
        // sent: 0,
    }
    let unreadChats = user.chats.filter(c => !c.isRead);
    unreadChats.forEach(c => {
        if (c.isDeleted) {
            unReadObj.deleted++;
            return;
        };
        if (c.isInbox) unReadObj.inbox++;
        if (c.isFavorite) unReadObj.favorite++;
        // if (c.isSent) unReadObj.sent++;
    });
    return unReadObj;
};

// קבלת צ'אטים על פי חיפוש
async function getChatsBySearch(userId, box, input) {
    let user = await users.getUser({ _id: userId });
    if (!user) throw { code: 404, msg: 'user not found' };

    let chats = await getChatsByFilter(userId, box);

    // מעבר על כל הצ'אטים מהחינת הנושא, המשתתפים ותוכן ההודעות וחיפוש אם כוללים משהו
    let result = chats.filter(c => {
        let chatName = c.chat.subject.toLowerCase();
        let chatMembers = c.chat.members.map(m => m.userName.toLowerCase());
        let chatMessages = c.chat.messages.map(m => htmlToPlainText(m.content).toLowerCase());
        return chatName.includes(input.toLowerCase()) ||
            chatMembers.some(m => m.includes(input.toLowerCase())) ||
            chatMessages.some(m => m.includes(input.toLowerCase()));
    })
    return result;
};

module.exports = {
    getChatsByFilter,
    getSingleChat,
    updateReadChat,
    createNewChat,
    deleteChat,
    deleteChatForever,
    addMsgToChat,
    updateChat,
    getUnreadChats,
    getChatsBySearch,
    addLabelToChat,
    removeLabelFromChat,
}