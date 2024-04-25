const users = require('../DL/controllers/user.controller');

async function offerEmails(emailStartsWith = '') {
    let emails = await users.getUsers({ email: { $regex: `^${emailStartsWith}` } }, 'email');
    return emails;
}

// קבלת כל התגיות הקיימות של היוזר
async function getAllLabels(userId) {
    let user = await users.getUser({ _id: userId });
    if (!user) throw { code: 404, msg: 'user not found' };

    let uniqueLabels = {};
    user.chats.forEach(chat => {
        chat.labels.forEach(label => {
            if (!uniqueLabels[label.title]) {
                uniqueLabels[label.title] = { color: label.color, title: label.title };
            }
        });
    });

    let allLabels = Object.values(uniqueLabels);

    return allLabels;
}

module.exports = { offerEmails, getAllLabels }