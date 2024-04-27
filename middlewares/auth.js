const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET

async function auth(req, res, next) {

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send('Unauthorized');
    }

    const token = authHeader.replace("Bearer ", "");
    try {
        // של היוזר ממנו ID-בדיקת הטוקן והוצאת ה 
        const decoded = jwt.verify(token, JWT_SECRET);

        // של היוזר בבקשה ID-השמת ה
        req.user = { _id: decoded.userId };

        next();
    }
    catch {
        res.status(401).json({ message: 'Token is not valid' });
    }
}

module.exports = { auth }