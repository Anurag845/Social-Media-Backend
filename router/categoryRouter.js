"use strict";

const express = require("express");
const categoryRouter = new express.Router();
const authController = require('../controller/authController');
const categoryController = require('../controller/categoryController');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: 'uploads/categories',
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
});

const upload = multer({storage: storage});

categoryRouter.post("/getCategories", [
    authController.validJWTNeeded,
    categoryController.getCategories
]);

module.exports = categoryRouter;
