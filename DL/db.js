const mongoose = require('mongoose');
const MONGO_URL = process.env.MONGO_URL

async function connect() {
    // connect : msg
    try {
        await mongoose.connect(MONGO_URL)
        console.log("DB - connection succeeded")
    } catch (error) {
        console.log("MongoDB Error: ", error);
    }
}

module.exports = {connect}