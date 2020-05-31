"use strict"

const express = require("express");
const groupRouter = new express.Router();
const authController = require('../controller/authController');
const groupController = require('../controller/groupController');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: 'uploads/groups',
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
});

const upload = multer({storage: storage});

groupRouter.post('/createGroup', [
    authController.validJWTNeeded,
    upload.single('group_image'),
    groupController.createGroup
]);

groupRouter.post('/getAllUserGroups', [
    authController.validJWTNeeded,
    groupController.getAllUserGroups
]);

groupRouter.post('/getUserGroupsbyCategory', [
    authController.validJWTNeeded,
    groupController.getUserGroupsbyCategory
]);

groupRouter.post('/getParticipants', [
    authController.validJWTNeeded,
    groupController.getParticipants
]);

groupRouter.post('/getInfo', [
    authController.validJWTNeeded,
    groupController.getGroupInfo
]);

groupRouter.post('/getInviteList', [
    authController.validJWTNeeded,
    groupController.getInviteList
]);

groupRouter.post('/invite', [
    authController.validJWTNeeded,
    groupController.invite
]);

module.exports = groupRouter;
