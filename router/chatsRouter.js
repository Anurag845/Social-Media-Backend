"use strict";

const express = require("express");
const chatsRouter = new express.Router();

const authController = require('../controller/authController');
const chatsController = require('../controller/chatsController');

chatsRouter.post("/createGroup", [
    authController.validJWTNeeded,
    chatsController.createGroup
])

chatsRouter.post("/getGroupChats", [
    authController.validJWTNeeded,
    chatsController.getGroupChats
]);

chatsRouter.post("/getUserGroups", [
    authController.validJWTNeeded,
    chatsController.getUserGroups
]);

chatsRouter.post("/getPersonalChats", [
    authController.validJWTNeeded,
    chatsController.getPersonalChats
]);

chatsRouter.post("/deletePersonalChat", [
    authController.validJWTNeeded,
    chatsController.deletePersonalChat
]);

chatsRouter.post("/deleteGroup", [
    authController.validJWTNeeded,
    chatsController.deleteGroup
]);

module.exports = chatsRouter;
