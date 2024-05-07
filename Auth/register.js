const users = require('../DL/controllers/user.controller');
const chatService = require('../BL/chat.service');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET
// טיפול בתמונה
const cloudinary = require('cloudinary').v2;

// Cloudinary הגדרת
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


async function register(req, res) {
    try {
        let { userName, email, password, image } = req.body;

        // בדיקה אם המשתמש כבר קיים במערכת
        let user = await users.getUser({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // טיפול בתמונה
        if (image) {
            try {
                const result = await cloudinary.uploader.upload(image, { folder: 'mailBox', resource_type: 'image' });
                image = result.url;
            } catch (error) {
                console.error('Error uploading image to Cloudinary:', error);
                return res.status(500).json({ message: 'Failed to upload image' });
            }
        } else {
            image = "https://www.freeiconspng.com/thumbs/profile-icon-png/am-a-19-year-old-multimedia-artist-student-from-manila--21.png"
        }

        // הצפנת הסיסמה
        const hashedPassword = await bcrypt.hash(password, 10);
        // לשים פה את הקישור מהתמונה שהועלתה
        user = await users.createUser({ userName, email, password: hashedPassword, image });

        console.log("new user: ", user)

        // הודעת פתיחה שתשלח ליוזר
        const system = await users.getUser({ email: 'System@mailBox.com' });
        let welcomeMsg = {
            subject: `Welcome to MailBox - Your All-in-One Communication Solution`,
            messages: `[{"date":"${new Date()}","content":"<p>Dear ${user.userName},</p><p><strong>Congratulations on signing up for MailBox!</strong> We're thrilled to have you on board and want to extend a warm welcome to our platform.</p><p>MailBox is designed to revolutionize the way you communicate, offering a comprehensive suite of features that streamline your interactions and make staying connected easier than ever before.</p><p>Here's a glimpse of what MailBox has to offer:</p><ol><li><strong>Effortless Messaging:</strong> Send messages to individuals or groups with ease, keeping your conversations organized and accessible.</li><li><strong>Intuitive Interface:</strong> Our user-friendly interface ensures a seamless experience, allowing you to navigate the application effortlessly.</li><li><strong>Labeling and Organization:</strong> Organize your messages with customizable labels, making it simple to categorize and find what you need.</li><li><strong>Secure Communication:</strong> Rest assured that your messages are secure with MailBox's advanced security features, keeping your conversations private.</li></ol><p><br></p><p>We're excited to have you join our community and look forward to providing you with a seamless communication experience. Should you have any questions or need assistance, feel free to reach out to our support team at ${system.email}.</p><p><br></p><p><strong>Welcome aboard, and happy communicating!</strong></p><p><br></p><p>Best regards,</p><p>The MailBox Team</p>","from":"${system._id}"}]`,
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


        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({ token });

    } catch (error) {
        console.error(error);
        res.status(500).send('Server error registering');
    }
}

module.exports = { register }