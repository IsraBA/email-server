const users = require('../DL/controllers/user.controller');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET

// פונקציית בדיקת הטוקן בעליית האפליקציה
async function tokenToUser(req, res) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).send('Unauthorized');
        }

        const token = authHeader.replace("Bearer ", "");

        const decoded = jwt.verify(token, JWT_SECRET);
        const data = await users.getUser({ _id: decoded.userId });
        if (!data) throw "Unauthorized"

        const user = {
            userName: data.userName,
            email: data.email,
            image: data.image,
            _id: data._id,
            labels: data.labels
        };

        res.status(200).json(user);

    } catch (err) {
        res.status(401).send("Unauthorized")
    }
};

module.exports = tokenToUser;