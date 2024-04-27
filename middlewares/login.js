const users = require('../DL/controllers/user.controller');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET

async function login(req, res) {
    try {
        const { email, password } = req.body;

        let user = await users.getUser({ email }, true);
        if (!user) return res.status(400).send({ message: "Username or password incorrect" });
        console.log('this user just connected: ', user.userName)

        // בדיקת הסיסמה
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).send({ message: "Username or password incorrect" });

        // יצירת טוקן
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

        res.status(200).json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
}

module.exports = { login }