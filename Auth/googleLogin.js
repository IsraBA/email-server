const users = require('../DL/controllers/user.controller');
const chatService = require('../BL/chat.service')
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client();

async function googleLogin(req, res) {
    const { clientId, credential } = req.body
    // console.log({ clientId, credential, select_by })

    try {
        // בדיקה בשרתים של גוגל שהטוקן תקין
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: clientId,
        });
        const payload = ticket.getPayload();
        // console.log('payload: ', payload);

        let user = await users.getUser({ email: payload.email });
        if (!user) {
            user = await users.createUser({
                userName: payload.name,
                email: payload.email,
                image: payload.picture
            });

            // הודעת פתיחה שתשלח ליוזר
            const system = await users.getUser({ email: 'System@mailBox.com' });
            let welcomeMsg = {
                subject: `Welcome to TalkLane - Simplifying communication with Labels`,
                messages: `[{"date":"${new Date()}","content":"<p><strong>Dear ${user.userName}, welcome to TalkLane!</strong></p><p><br></p><p>We're delighted to have you join our community.</p><p>At TalkLane, we believe in making communication easy and efficient. Our platform features an intuitive and friendly interface designed to streamline your messaging experience.</p><p><br></p><p>One of our key features is the ability to <strong>organize your messages using customizable labels</strong>. This feature allows you to categorize your conversations by topics, making it simple to find and manage your messages.</p><p><br></p><p>Discover the convenience of our <strong>user-friendly interface</strong> and the power of organized communication with TalkLane.</p><p><br></p><p>If you have any questions or need assistance, feel free to contact us at <strong>${system.email}</strong>.</p><p><br></p><p>We're excited to have you on board and look forward to enhancing your messaging experience with TalkLane!</p><p><br></p><p>Best regards,</p><p>The TalkLane Team</p>","from":"${system._id}"}]`,
                lastDate: new Date(),
                members: `[{"email":"${system.email}","_id":"${system._id}"},{"email":"${user.email}","_id":"${user._id}"}]`
            }
            await chatService.createNewChat(system._id, welcomeMsg);

            // הוספת תוויות ברירת מחדל
            const defaultLabels = [
                { color: '#ff0000', title: 'important' },
                { color: '#8849fd', title: 'work' },
                { color: '#a8d888', title: 'Work in progress' },
                { color: '#aeeae9', title: 'In acceptance' },
                { color: '#dcb4fe', title: 'Read later' }
            ];
            user.labels = defaultLabels;
            await users.save(user);

            console.log("new user: ", user)
        }

        console.log('this user just connected: ', user.userName)

        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({ token });
    } catch (err) {
        console.log(err)
        res.status(400).json({ err });
    }
}

module.exports = { googleLogin }
