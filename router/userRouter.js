"use strict";
//created by Hatem Ragap
const express = require("express");
const userRouter = new express.Router();
const userController = require('../controller/userController');
const authController = require('../controller/authController');
const multer = require('multer');
//img path
// http://localhost:5000/uploads/users_profile_img/1582645366303-apple-logo.png
const storage = multer.diskStorage({
    destination: 'uploads/users_profile_img',
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
});

const upload = multer({storage: storage});
userRouter.post("/create", userController.createUser); // /api/user/create
userRouter.post("/login", [
    authController.hasAuthValidFields,
    authController.isPasswordAndUserMatch,
    userController.loginUser
]);
 // /api/user/login
userRouter.post("/update_password", [
    authController.validJWTNeeded,
    userController.updatePassword
]); // /api/user/login

userRouter.post("/update_bio_and_name", userController.update_bio_and_name); // /api/user/login

userRouter.post("/get_likes_posts_comments_counts", [
    authController.validJWTNeeded,
    userController.get_likes_posts_comments_counts
]); // /api/user/login

userRouter.post("/get", [
    authController.validJWTNeeded,
    userController.getUser
]); // /api/user/get

userRouter.post("/getUserByEmail", [
    authController.validJWTNeeded,
    userController.getUserByEmail
]); // /api/user/get

userRouter.post("/getUsers", [
    authController.validJWTNeeded,
    userController.getUsers
]);
 // /api/user/get
userRouter.post("/img", upload.single('img'), userController.addUserImg);
userRouter.post("/update_bio", userController.update_bio);

userRouter.post('/update_user_token', [
    authController.validJWTNeeded,
    userController.updateAndAddUserToken
]);


module.exports = userRouter;
