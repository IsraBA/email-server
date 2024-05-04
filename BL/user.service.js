const users = require('../DL/controllers/user.controller');

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

module.exports = {
    offerEmails,
    getAllLabels,
    addLabelToUser,
    deleteLabelFromUser,
    changeLabelName,
}