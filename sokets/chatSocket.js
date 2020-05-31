const _ = require("underscore");

const conn = require('../dbconfig/mysql.service.js');
const moment = require('moment');
const uuidv4 = require('uuid').v4;

module.exports = io => {
    var admin = require("firebase-admin");

    io.of("/api/joinConversation").on("connection", socket => {

        let conversationId;
        socket.on("joinConversation", function(msg) {
            let objectValue = JSON.parse(msg);
            conversationId = objectValue["conversation_id"];
            let username = objectValue["username"];
            socket.join(conversationId);

            var clientsInRoom = io.nsps["/api/joinConversation"].adapter.rooms[conversationId];
            var numClients =
            clientsInRoom === undefined
              ? 0
              : Object.keys(clientsInRoom.sockets).length;

              let w =
              '{"sendername":"' +username +'", "numClients":"' +numClients +'"}';

            socket.to(conversationId).emit("UserJoin", w);
        });

        socket.on("getNumOfClints", async msg => {
            var clientsInRoom = io.nsps["/api/joinConversation"].adapter.rooms[msg];
            var numClients =
              clientsInRoom === undefined
                ? 0
                : Object.keys(clientsInRoom.sockets).length;
                socket.to(msg).emit("onNumOfClints", numClients);
        });

        socket.on("new_comment", async msg => {

            let objectValue = JSON.parse(msg);
            let message = objectValue["message"];
            let sender_id = objectValue["sender_id"];
            let sender_name = objectValue["sender_name"];
            let sender_img = objectValue["sender_img"];
            let chat_id = objectValue["chat_id"];
            let conversation_id = objectValue["conversation_id"];
            let message_type = objectValue["message_type"];
            let image = objectValue["image"];
            let chat_type = objectValue["chat_type"];

            var attachment = {};

            if(message_type == 1) {
                attachment.name = image;
                attachment.guid = uuidv4().replace(/-/g, '');
            }

            conn.query(
              'INSERT INTO messages(id,conversation_id,sender_id,message,attachments,created_at,deleted_at) \
               VALUES(?,?,?,?,?,?,?)',
              [
                  uuidv4().replace(/-/g, ''),
                  conversation_id,
                  sender_id,
                  message,
                  JSON.stringify(attachment),
                  moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
                  moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')
              ],
              (error,result) => {
                  if(error) {
                      console.log("error is " + error);
                  }
                  else {
                      let w =
                        '{"sender_id":"' + sender_id +
                        '","sender_name":"' + sender_name +
                        '","message":"' + message +
                        '","sender_img":"' + sender_img +
                        '","conversation_id":"' + conversation_id +
                        '","message_type":"' + message_type +
                        '","image":"' + image +
                        '"}';

                      socket.to(conversation_id).broadcast.emit("RoomMsgReceive", w);
                  }
              }
            );

            if(chat_type === 'PC') {
                let fcm_token;
                conn.query(
                    'SELECT fcm_token FROM users WHERE user_id = ?',
                    [
                        chat_id
                    ],
                    (error, result) => {
                        if(error) {
                            console.log("Error is " + error);
                        }
                        else {
                            fcm_token = result[0].fcm_token;

                            var payload = {
                                notification: {
                                    body: `${message}`,
                                    title: `${sender_name} has sent a message`
                                },
                                data: {
                                    "img": `${sender_img}`,
                                    "name": `${sender_name}`,
                                    "id": `${sender_id}`,
                                    "chat_id": `${chat_id}`,
                                    "conversation_id": `${conversation_id}`,
                                    "screen": "chat",
                                    'click_action': 'FLUTTER_NOTIFICATION_CLICK',
                                }
                            };
                            var options = {
                                priority: "high",
                                timeToLive: 60 * 60 * 24
                            };

                            admin
                                .messaging()
                                .sendToDevice(fcm_token, payload, options)
                                .then(function (ress) {

                                })
                                .catch(function (err) {
                                    console.log("error is " + err);
                                });
                        }
                    }
                )
            }
            /*conn.query(
                'SELECT u.fcm_token FROM users u, participants p WHERE u.user_id = p.user_id AND p.conversation_id = ?',
                [
                    conversation_id
                ],
                (error, result) => {
                    if(error) {
                        console.log("Error is " + error);
                    }
                    else {
                        tokenList = result.remove()
                    }
                }
            );*/
        });

        socket.on("disconnect", socket => {
            console.log("A user is Disconnected from a Chat");
        });
    });
};
