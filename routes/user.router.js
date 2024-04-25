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

module.exports = router;