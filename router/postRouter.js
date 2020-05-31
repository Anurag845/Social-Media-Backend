"use strict";

const express = require("express");
const postRouter = new express.Router();
const authController = require('../controller/authController');
const postsController = require('../controller/postsController');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: 'uploads/users_posts_img',
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
});

const upload = multer({storage: storage});

postRouter.post("/create", [
    authController.validJWTNeeded,
    upload.array('attachments',2),
    postsController.createPost
]);

postRouter.post("/fetch", [
    authController.validJWTNeeded,
    postsController.getPosts
]);

postRouter.post("/getPostById", [
    authController.validJWTNeeded,
    postsController.getPostById
]);

postRouter.post("/deletePost", [
    authController.validJWTNeeded,
    postsController.deletePost
]);

postRouter.post("/fetch_posts_by_user_id", [
    authController.validJWTNeeded,
    postsController.fetch_posts_by_user_id
]);

module.exports = postRouter;
