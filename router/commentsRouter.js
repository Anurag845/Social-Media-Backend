"use strict";
//created by Hatem Ragap
const express = require("express");
const commentRouter = new express.Router();
const commentController = require('../controller/commentController');
const authController = require('../controller/authController');

commentRouter.post("/create", [
    authController.validJWTNeeded,
    commentController.createComment
]);

commentRouter.post("/delete", [
    authController.validJWTNeeded,
    commentController.deleteComment
]);

commentRouter.post("/fetch_all", [
    authController.validJWTNeeded,
    commentController.getComments
]);

module.exports = commentRouter;
