require('dotenv').config();
const express = require('express');
const app = express();

const db = require('./DL/db');
db.connect();

const cors = require('cors');
app.use(cors());
app.use(express.json());

const { auth } = require('./middlewares/auth')
app.all('*', auth)

const chatRouter = require('./routes/chat.router');
app.use('/chat', chatRouter);

const userRouter = require('./routes/user.router');
app.use('/user', userRouter);

// require('./DL/test_data')
app.listen(3002, () => console.log("****server is listening on 3002****"));