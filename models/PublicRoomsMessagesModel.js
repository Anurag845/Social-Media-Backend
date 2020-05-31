"use strict";
//created by Hatem Ragap
const mongoose = require("mongoose");

// message type 0 mean is only String in flutter ignore img field
// message type 1  mean is only Img in flutter ignore message field
const messageSchema = mongoose.Schema({
  message: {
    type: String,
    default: ""
  },

  sender_id: { type: mongoose.Schema.Types.ObjectId },

  sender_name: { type: String },
  sender_img: { type: String },
  room_id: {
    type: mongoose.Schema.Types.ObjectId
  },

  createdAt: {
    type: Number,
    default: Date.now
  }
});

const PublicRoomMessageSchemaModel = mongoose.model(
  "publicRoomMessages",
  messageSchema
);
module.exports = {
  PublicRoomMessageSchemaModel
};
