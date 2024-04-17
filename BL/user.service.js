const users = require('../DL/controllers/user.controller');

async function offerEmails(emailStartsWith = '') {
    let emails = await users.getUsers({ email: { $regex: `^${emailStartsWith}` } }, 'email');
    return emails;
}

module.exports = { offerEmails }