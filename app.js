"use strict";
//created by Hatem Ragap
const cors = require('cors');
const helmet = require('helmet'); // helmet morgan body-parser mongoose
const morgan = require('morgan');
const bodyParser = require('body-parser');
const express = require("express");
const mongoose = require('mongoose');
const userRouter = require('./router/userRouter');
const postRouter = require('./router/postRouter.js');
const likesRouter = require('./router/likesRouter');
const commentRouter = require('./router/commentsRouter');
const notificationsRouter = require('./router/notificationsRouter');
const chatsRouter = require('./router/chatsRouter');
const chatMessagesRouter = require('./router/chatMessagesRouter');
const categoryRouter = require('./router/categoryRouter');
const groupRouter = require('./router/groupRouter');
const app = express();
// adding Helmet to enhance your API's security
app.use(helmet());

// enabling CORS for all requests
app.use(cors());

// adding morgan to log HTTP requests
app.use(morgan('combined'));

app.use(express.json());

//to send data from post man and any front end
app.use(bodyParser.urlencoded({ extended: false }));

// public place for img
app.use('/uploads', express.static('uploads'));

// parse an HTML body into a string
app.use(bodyParser.json());
const serviceAccount = require('./chat-app-d987f-firebase-adminsdk-67w7b-89e1927b5b.json');
var admin = require("firebase-admin");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://chat-app-d987f.firebaseio.com"
});

// for local
/*const mongoUrlLocal =  'mongodb://localhost/v_chat_mongo';
mongoose.connect(mongoUrlLocal, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(() => {
    //console.log('connected to data base');
});*/

// static end point for user api
app.use('/api/user', userRouter);
app.use('/api/post', postRouter);
app.use('/api/like', likesRouter);
app.use('/api/comment', commentRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/chats', chatsRouter);
app.use('/api/chatMessages', chatMessagesRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/groups', groupRouter);

module.exports = app;
