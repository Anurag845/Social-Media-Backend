"use strict";

const express = require("express");
const notificationsRouter = new express.Router();
const notificationsController = require('../controller/notificationController');


notificationsRouter.post("/fetch_all", notificationsController.getNotifications);


module.exports = notificationsRouter;
