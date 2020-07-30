"use strict";

const express = require("express");
const likesRouter = new express.Router();
const likesController = require('../controller/likesController');
const authController = require('../controller/authController');

likesRouter.post("/create", [
    authController.validJWTNeeded,
    likesController.createLike
]);

likesRouter.post("/delete", [
    authController.validJWTNeeded,
    likesController.deleteLike
]);

module.exports = likesRouter;
