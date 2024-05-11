// ייבוא האקספרס
const express = require('express');
// הגדרת הראוטר בתוך האקספרס
const router = express.Router();
// ייבוא השירותים
const service = require('../BL/user.service');

// קבלת כל האימיילים של היוזרים
router.get('/emails/:chars', async (req, res) => {
    try {
        const emails = await service.offerEmails(req.params.chars);
        res.send(emails);
    } catch (error) {
        res.status(error?.code || 500).send(error.msg || error || "something went wrong");
    }
})

// קבלת כל התגיות הקיימות של היוזר
router.get('/getAllLabels', async (req, res) => {
    try {
        const allLabels = await service.getAllLabels(req.user._id);
        res.send(allLabels);
    } catch (error) {
        console.log(error)
        res.status(error?.code || 500).send(error.msg || error || "something went wrong");
    }
})

// הוספת תווית ליוזר
router.post('/addLabelToUser', async (req, res) => {
    try {
        const labels = await service.addLabelToUser(req.user._id, req.body);
        res.send(labels);
    } catch (error) {
        console.log(error)
        res.status(error?.code || 500).send(error.msg || error || "something went wrong");
    }
})

// מחיקת תווית ליוזר
router.delete('/deleteLabelFromUser/:labelTitle', async (req, res) => {
    try {
        const labels = await service.deleteLabelFromUser(req.user._id, req.params.labelTitle);
        res.send(labels);
    } catch (error) {
        console.log(error)
        res.status(error?.code || 500).send(error.msg || error || "something went wrong");
    }
})

// שינוי שם תווית ליוזר
router.put('/changeLabelName', async (req, res) => {
    try {
        const labels = await service.changeLabelName(req.user._id, req.body);
        res.send(labels);
    } catch (error) {
        console.log(error)
        res.status(error?.code || 500).send(error.msg || error || "something went wrong");
    }
})

// שינוי פרטי היוזר (שם או סיסמה)
router.put('/changeUserInfo', async (req, res) => {
    try {
        const user = await service.changeUserInfo(req.user._id, req.body);
        res.send(user);
    } catch (error) {
        console.log(error)
        res.status(error?.code || 500).send(error.msg || error || "something went wrong");
    }
});

module.exports = router;