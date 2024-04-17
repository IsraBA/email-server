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

// קבלת צ'ט יחיד
router.get('/singleChat/:id', async (req, res) => {
    try {
        const chat = await service.getSingleChat(req.user._id, req.params.id);
        res.send(chat);
    } catch (error) {
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

// מחיקת צ'ט והעברתו למחוקים
router.put('/deleteChat/:chatId', async (req, res) => {
    try {
        const chat = await service.deleteChat(req.user._id, req.params.chatId);
        res.send(chat);
    } catch (error) {
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