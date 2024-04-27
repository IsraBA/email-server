const users = require('../DL/controllers/user.controller');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET

async function register(req, res) {
    try {
        const { userName, email, password, image } = req.body;

        // בדיקה אם המשתמש כבר קיים במערכת
        let user = await users.getUser({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // להוסיף טיפול בתמונה

        // הצפנת הסיסמה
        const hashedPassword = await bcrypt.hash(password, 10);
        // לשים פה את הקישור מהתמונה שהועלתה
        user = await users.createUser({ userName, email, password: hashedPassword, image: "https://www.freeiconspng.com/thumbs/profile-icon-png/am-a-19-year-old-multimedia-artist-student-from-manila--21.png" });

        console.log("new user: ", user)

        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({ token });

    } catch (error) {
        console.error(error);
        res.status(500).send('Server error registering');
    }
}

module.exports = { register }