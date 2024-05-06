require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

// Increase the limit for handling request payloads to 10MB
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

const db = require('./DL/db');
db.connect();

const cors = require('cors');
app.use(cors());
app.use(express.json());

const multer = require('multer');
const upload = multer({
    limits: {
        fieldSize: 10 * 1024 * 1024, // 10MB in bytes
    },
});

const { register } = require('./middlewares/register')
app.post('/register', upload.single('image'), register);

const { login } = require('./middlewares/login')
app.post('/login', login);

const tokenToUser = require('./middlewares/tokenToUser')
app.get('/getUserWithToken', tokenToUser);

const { auth } = require('./middlewares/auth')
app.all('*', auth);

const chatRouter = require('./routes/chat.router');
app.use('/chat', chatRouter);

const userRouter = require('./routes/user.router');
app.use('/user', userRouter);

// require('./DL/test_data')
app.listen(3002, () => console.log("****server is listening on 3002****"));