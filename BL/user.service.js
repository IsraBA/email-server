const users = require('../DL/controllers/user.controller');
const bcrypt = require('bcrypt');
// טיפול בתמונה
const cloudinary = require('cloudinary').v2;

// Cloudinary הגדרת
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

async function offerEmails(emailStartsWith = '') {
    let emails = await users.getUsers({ email: { $regex: `^${emailStartsWith}` } }, 'email');
    return emails;
}

// קבלת כל התגיות הקיימות של היוזר
async function getAllLabels(userId) {
    let user = await users.getUser({ _id: userId });
    if (!user) throw { code: 404, msg: 'user not found' };
    return user.labels;
}

// הוספת תווית ליוזר
async function addLabelToUser(userId, label) {
    let user = await users.getUser({ _id: userId });
    if (!user) throw { code: 404, msg: 'user not found' };

    // בדיקה אם התווית קיימת במערך התוויות
    let existingLabel = user.labels.find(l => l.title === label.title);

    if (existingLabel) {
        return user.labels;
    } else {
        // אם לא קיים מוסיף אותה למערך התוויות
        user.labels.push(label);
        await users.save(user);
    }

    user = await users.getUser({ _id: userId });
    if (!user) throw { code: 404, msg: 'user not found' };

    return user.labels;
}

// מחיקת תווית מיוזר
async function deleteLabelFromUser(userId, labelTitle) {
    let user = await users.getUser({ _id: userId });
    if (!user) throw { code: 404, msg: 'user not found' };

    // מחיקת התווית ממערך התוויות הראשי
    user.labels = user.labels.filter(l => l.title != labelTitle);

    // מחיקת התווית מכל מערך תוויות פנימי של כל צ'אט
    user.chats.forEach(chat => {
        chat.labels = chat.labels.filter(l => l != labelTitle);
    });

    // עדכון הדטאבייס
    await users.save(user);

    return user.labels;
}

// שינוי שם תווית ביוזר
async function changeLabelName(userId, updatedLabel) {
    let user = await users.getUser({ _id: userId });
    if (!user) throw { code: 404, msg: 'user not found' };

    // עדכון התווית במערך התוויות הראשי
    let label = user.labels.find(l => l._id == updatedLabel._id);
    if (!label) throw { code: 404, msg: 'label not found' };

    // עדכון כל מערכי התוויות הפנימיים שמכילים את התווית בשם החדש שלה
    user.chats.forEach(chat => {
        chat.labels = chat.labels.map(l => l == label.title ? updatedLabel.title : l);
    });

    // עדכון התווית במערך הראשי
    label.title = updatedLabel.title;
    if (updatedLabel.color) {
        label.color = updatedLabel.color;
    }

    // עדכון הדטאבייס
    await users.save(user);

    return user.labels;
}

// שינוי פרטי היוזר (שם או סיסמה)
async function changeUserInfo(userId, updatedUser) {
    let user = await users.getUser({ _id: userId }, true);
    if (!user) throw { code: 404, msg: 'user not found' };

    if (updatedUser.newPassword && updatedUser.oldPassword) {
        // בדיקת הסיסמה
        const isMatch = await bcrypt.compare(updatedUser.oldPassword, user.password);
        if (!isMatch) throw { code: 400, msg: "password incorrect" };

        // הצפנת הסיסמה
        const hashedPassword = await bcrypt.hash(updatedUser.newPassword, 10);
        user.password = hashedPassword;
    }
    if (updatedUser.name) {
        user.userName = updatedUser.name;
    }
    if (updatedUser.image) {
        try {
            const result = await cloudinary.uploader.upload(updatedUser.image, { folder: 'mailBox', resource_type: 'image' });
            let image = result.url;

            // מחיקת התמונה הקודמת
            if (user.image.startsWith('http://res.cloudinary.com')) {
                const publicId = user.image.split('/').pop().split('.')[0];
                // console.log("publicId: ", publicId)
                await cloudinary.uploader.destroy('mailBox/' + publicId);
            }
            user.image = image;
        } catch (error) {
            console.error('Error uploading image to Cloudinary:', error);
            throw { code: 500, msg: 'Failed to upload image' };
        }
    }

    await users.save(user);

    return { userName: user.userName, image: user.image };
};

module.exports = {
    offerEmails,
    getAllLabels,
    addLabelToUser,
    deleteLabelFromUser,
    changeLabelName,
    changeUserInfo,
}