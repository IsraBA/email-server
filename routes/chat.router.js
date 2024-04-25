// ייבוא האקספרס
const express = require('express');
// הגדרת הראוטר בתוך האקספרס
const router = express.Router();
// ייבוא השירותים
const service = require('../BL/chat.service');
const multer = require('multer');
const upload = multer();

// קבלת צ'אטים על פי קטגוריה
router.get('/:flag', async (req, res) => {
    try {
        const chats = await service.getChatsByFilter(req.user._id, req.params.flag);
        res.send(chats);
    } catch (error) {
        res.status(error?.code || 500).send(error.msg || error || "something went wrong");
    }
})

// קבלת כמות צ'אטים שלא נקראו בכל תיבה
router.get('/unreadCount/unreadObj', async (req, res) => {
    try {
        const unreadObj = await service.getUnreadChats(req.user._id);
        res.send(unreadObj);
    } catch (error) {
        res.status(error?.code || 500).send(error.msg || error || "something went wrong");
    }
})

// קבלת צ'ט יחיד
router.get('/singleChat/:id', async (req, res) => {
    try {
        const chat = await service.getSingleChat(req.user._id, req.params.id);
        res.send(chat);
    } catch (error) {
        res.status(error?.code || 500).send(error.msg || error || "something went wrong");
    }
})

// קבלת צ'טים על פי חיפוש
router.get('/:box/search/:input', async (req, res) => {
    try {
        const chat = await service.getChatsBySearch(req.user._id, req.params.box, req.params.input);
        res.send(chat);
    } catch (error) {
        console.log(error)
        res.status(error?.code || 500).send(error.msg || error || "something went wrong");
    }
})

// התחלת צ'ט חדש
router.post('/', upload.any(), async (req, res) => {
    try {
        const newChat = await service.createNewChat(req.user._id, req.body);
        res.send(newChat);
    } catch (error) {
        res.status(error?.code || 500).send(error.msg || error || "something went wrong");
    }
})

// שליחת הודעה בצ'ט קיים
router.put('/:chatId', async (req, res) => {
    try {
        const chat = await service.addMsgToChat(req.params.chatId, req.body);
        res.send(chat);
    } catch (error) {
        res.status(error?.code || 500).send(error.msg || error || "something went wrong");
    }
})

// סימון צ'ט כנקרא
router.put('/markAsRead/:chatId', async (req, res) => {
    try {
        const chat = await service.updateReadChat(req.user._id, req.params.chatId);
        res.send(chat);
    } catch (error) {
        res.status(error?.code || 500).send(error.msg || error || "something went wrong");
    }
})

// סימון הצ'ט כלא נקרא
router.put('/markAsUnread/:chatId', async (req, res) => {
    try {
        const chat = await service.updateChat(req.user._id, req.params.chatId, ["read", false]);
        res.send(chat);
    } catch (error) {
        console.log(error)
        res.status(error?.code || 500).send(error.msg || error || "something went wrong");
    }
})

// הוספת הצ'ט למועדפים
router.put('/addToFavorite/:chatId', async (req, res) => {
    try {
        const chat = await service.updateChat(req.user._id, req.params.chatId, ["favorite", true]);
        res.send(chat);
    } catch (error) {
        console.log(error)
        res.status(error?.code || 500).send(error.msg || error || "something went wrong");
    }
})

// הסרת הצ'ט למועדפים
router.put('/removeFromFavorite/:chatId', async (req, res) => {
    try {
        const chat = await service.updateChat(req.user._id, req.params.chatId, ["favorite", false]);
        res.send(chat);
    } catch (error) {
        console.log(error)
        res.status(error?.code || 500).send(error.msg || error || "something went wrong");
    }
})

// הוספת תגית לצ'ט
router.post('/addLabel/:chatId', async (req, res) => {
    try {
        const labels = await service.addLabelToChat(req.user._id, req.params.chatId, req.body);
        res.send(labels);
    } catch (error) {
        console.log(error)
        res.status(error?.code || 500).send(error.msg || error || "something went wrong");
    }
})

// מחיקת צ'ט והעברתו למחוקים
router.put('/deleteChat/:chatId', async (req, res) => {
    try {
        const chat = await service.deleteChat(req.user._id, req.params.chatId);
        res.send(chat);
    } catch (error) {
        console.log(error)
        res.status(error?.code || 500).send(error.msg || error || "something went wrong");
    }
})

// שחזור צ'ט
router.put('/restoreChat/:chatId', async (req, res) => {
    try {
        const chat = await service.updateChat(req.user._id, req.params.chatId, ["deleted", false]);
        res.send(chat);
    } catch (error) {
        console.log(error)
        res.status(error?.code || 500).send(error.msg || error || "something went wrong");
    }
})

// מחיקת צ'ט לתמיד
router.delete('/:chatId', async (req, res) => {
    try {
        const chat = await service.deleteChatForever(req.user._id, req.params.chatId);
        res.send(chat);
    } catch (error) {
        res.status(error?.code || 500).send(error.msg || error || "something went wrong");
    }
})

module.exports = router;