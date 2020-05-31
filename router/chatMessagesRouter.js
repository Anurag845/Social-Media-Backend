"use strict";

const express = require("express");
const chatMessagesRouter = new express.Router();

const authController = require('../controller/authController');
const chatMessagesController = require('../controller/chatMessagesController');

const multer = require('multer');
const storage = multer.diskStorage({
    destination: 'uploads/users_messages_img',
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
});

const upload = multer({storage: storage});

chatMessagesRouter.post('/getMessages', [
    authController.validJWTNeeded,
    chatMessagesController.getMessages
]);

chatMessagesRouter.post('/deleteMessage', [
    authController.validJWTNeeded,
    chatMessagesController.deleteMessage
]);

chatMessagesRouter.post('/uploadImage', [
    authController.validJWTNeeded,
    upload.single('image'),
    chatMessagesController.uploadImage,
]);

module.exports = chatMessagesRouter;
