const htmlToPlainText = (html) => {
    // Replace <br> tags with newline characters
    let plainText = html.replace(/<br\s*\/?>/gi, '\n');

    // Remove all other HTML tags
    plainText = plainText.replace(/<[^>]+>/g, ' ');

    return plainText;
};

module.exports = htmlToPlainText;