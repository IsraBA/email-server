const { Flags } = require('../utility');
const users = require('../DL/controllers/user.controller');
const chats = require('../DL/controllers/chat.controller');
const htmlToPlainText = require('../function/htmlToText');

// קבלת הצ'אטים של המשתמש על פי קטגוריה
async function getChatsByFilter(userId, filter) {
    if (!Flags[filter]) throw { code: 404, msg: 'box not found' };
    let { chats } = await users.readByFlags(userId, [Flags[filter]], { chats: true, users: true });

    // סידור הצ'אטים על פי התאריך שלהם
    chats.sort((a, b) => new Date(b.chat.lastDate) - new Date(a.chat.lastDate));

    return chats;
}

// קבלת הצ'אטים על פי תווית
async function getChatsByLabel(userId, labelTitle) {
    let { chats } = await users.readByLabel(userId, labelTitle);

    // סידור הצ'אטים על פי התאריך שלהם
    chats.sort((a, b) => new Date(b.chat.lastDate) - new Date(a.chat.lastDate));

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

// הוספת תווית לצ'אט
async function addLabelToChat(userId, chatId, labelTitle) {
    let user = await users.getUser({ _id: userId });
    if (!user) throw { code: 404, msg: 'user not found' };

    // מוסיף את האי-די שלה למערך התוויות של הצ'אט המבוקש
    let chat = user.chats.find(c => c._id.toString() === chatId);
    if (!chat) throw { code: 404, msg: 'chat not found' };

    // אם התווית לא קיימת במערך התוויות של הצ'אט מוסיף אותה
    if (!chat.labels.includes(labelTitle)) {
        chat.labels.push(labelTitle);
        await users.save(user);
    }

    chat = await getSingleChat(userId, chatId)

    // החזרת מערך התגיות המעודכן
    return chat.labels;
}

// הסרת תווית מצ'אט
async function removeLabelFromChat(userId, chatId, labelTitle) {
    let user = await users.getUser({ _id: userId });
    if (!user) throw { code: 404, msg: 'user not found' };

    let chat = user.chats.find(c => c._id == chatId);

    chat.labels = chat.labels.filter(label => label != labelTitle);

    await users.save(user);

    // החזרת מערך התגיות המעודכן
    return chat.labels;
}

// התחלת צ'ט חדש
async function createNewChat(userId, data) {
    // console.log('data', data)

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

// יצירת טיוטה חדשה
async function createNewDraft(userId, data) {
    // console.log('data: ', data)

    let user = await users.getUser({ _id: userId });
    if (!user) throw { code: 404, msg: 'user not found' };

    // סינון מיילים כפולים במידה ושלח גם לעצמו
    data.members = JSON.parse(data.members);
    data.members = Array.from(new Set(data.members.map(JSON.stringify))).map(JSON.parse);

    // יצירת מערך אי די במקום מערך האימיילים
    data.members = await Promise.all(data.members.map(email => emailToId(email)));

    data.messages = JSON.parse(data.messages);

    let newChat = await chats.createChat(data);

    // הוספת הצ'ט החדש לצ'אטים של היוזר אבל במצב טיוטה
    await users.updateUser({ _id: userId }, {
        $push: {
            chats: {
                chat: newChat._id,
                isRead: true,
                isInbox: false,
                isSent: false,
                isFavorite: false,
                isDraft: true,
                isDeleted: false,
                labels: []
            }
        }
    })

    user = await users.getUser({ _id: userId });
    if (!user) throw { code: 404, msg: 'user not found' };

    let drafts = user.chats.filter(c => c.isDraft);

    console.log("updated successfully")
    return drafts;
}

// עדכון טיוטה (שליחה שלה/עדכון שלה)
async function updateDraft(userId, chatId, sent = Boolean, data) {
    let user = await users.getUser({ _id: userId });
    if (!user) throw { code: 404, msg: 'user not found' };

    let chat = user.chats.find(c => c._id == chatId);
    if (!chat) throw { code: 404, msg: 'chat not found' };

    // סינון מיילים כפולים במידה ושלח גם לעצמו
    data.members = JSON.parse(data.members);
    data.members = Array.from(new Set(data.members.map(JSON.stringify))).map(JSON.parse);

    // יצירת מערך אי די במקום מערך האימיילים
    data.members = await Promise.all(data.members.map(email => emailToId(email)));

    data.messages = JSON.parse(data.messages);

    // console.log("sorted data: ", data)

    let chatToUpdate = await chats.getChat({ _id: chat.chat });
    if (!chatToUpdate) throw { code: 404, msg: 'chat not found' };

    chatToUpdate.subject = data.subject;
    chatToUpdate.messages = data.messages;
    chatToUpdate.lastDate = data.lastDate;
    chatToUpdate.members = data.members;

    await chats.save(chatToUpdate);

    // במידה ושלח את הטיוטה
    if (sent) {
        // עדכון של כל המשתתפים בשיחה בשיחה החדשה
        data.members.forEach(async memberId => {
            if (memberId == userId) {
                chat.isDraft = false;
                chat.isSent = true;
                chat.isInbox = memberId != userId || (memberId == userId && data.members.length == 1);
                chat.isRead = memberId == userId && data.members.length != 1;
                await user.save(user)
            } else {
                await users.updateUser({ _id: memberId }, {
                    $push: {
                        chats: {
                            chat: chat.chat,
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
            }
        })
        return "sent successfully";
    }
    // במידה ורק שינה את התוכן של הטיוטה
    else {
        return "updated successfully";
    }
};

// מחיקת טיוטה
async function deleteDraft(userId, chatId) {
    let user = await users.getUser({ _id: userId });
    if (!user) throw { code: 404, msg: 'user not found' };

    let chat = user.chats.find(c => c._id == chatId);
    if (!chat) throw { code: 404, msg: 'chat not found' };

    await chats.deleteChat(chat.chat);

    user.chats = user.chats.filter(c => c._id != chatId);
    await user.save(user);
    
    return "deleted successfully";
}

async function emailToId(email) {
    let user = await users.getUser({ email: email.email })
    if (!user) throw { code: 404, msg: 'user not found' };
    return user._id;
};

async function addMsgToChat(sender, chatId, newMsg) {
    let chat = await chats.getChat({ _id: chatId });
    // console.log('chat: ', chat)
    if (!chat) throw { code: 404, msg: 'chat not found' };

    let updateChat = [...chat.messages, newMsg];

    await chats.updateChat(chatId, { messages: updateChat, lastDate: newMsg.date });

    // עידכון כל המשתתפים בשיחה שהצ'ט יהיה בתיבת האינבוקס ולא נקרא
    let userIds = chat.members.map(m => m._id);
    userIds.forEach(async userId => {
        let user = await users.getUser({ _id: userId });
        if (!user) throw { code: 404, msg: 'One of the users not found' };

        let userChat = user.chats.find(c => c.chat == chatId);
        if (!userChat) throw { code: 404, msg: 'The chat not found' };

        if (userId != sender) {
            userChat.isRead = false;
            userChat.isInbox = true;
            users.save(user);
        }
    })

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
    getChatsByLabel,
    createNewDraft,
    updateDraft,
    deleteDraft
}