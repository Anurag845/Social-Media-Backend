"use strict";

const {userSchemaModel} = require("../models/userModel");
const {commentSchemaModel} = require("../models/commentsModel");
const {postSchemaModel} = require("../models/postsModel");
const {notificationsSchemaModel} = require("../models/notificationsModel");

var admin = require("firebase-admin");

const conn = require('../dbconfig/mysql.service.js');
const uuidv4 = require('uuid').v4;
const moment = require('moment');

module.exports = {
    createComment: async (req, res) => {
        const {user_id,entity_type,entity_id,descr,post_owner_id,username} = req.body;

        let comment_id = uuidv4().replace(/-/g, '');
        let timestamp = Date.now();
        let created_at = moment(timestamp).format('YYYY-MM-DD HH:mm:ss');
        var attachments = [];

        if(req.files) {
            req.files.forEach((image) => {
                var attachment = {};
                attachment.name = image.filename;
                attachment.guid = uuidv4().replace(/-/g, '');
                attachments.push(attachment);
            });
        }

        conn.query(
            'INSERT INTO comments VALUES(?,?,?,?,?,?,?,?,?,?,?)',
            [
                comment_id,
                entity_type,
                entity_id,
                user_id,
                descr,
                0,
                0,
                JSON.stringify(attachments),
                created_at,
                "",
                '{}'
            ],
            (error, result) => {
                if(error) {
                    res.status(500).send({
                        "error": true,
                        "data": error
                    });
                }
            }
        );

        conn.query(
            'UPDATE ?? SET comments_count = comments_count+1 WHERE ?? = ?',
            [
                entity_type + 's',
                entity_type + '_id',
                entity_id
            ],
            (error, result) => {
                if(error) {
                    res.status(500).send({
                        "error": true,
                        "data": error
                    });
                }
            }
        );

        if(user_id !== post_owner_id) {
            conn.query(
                'SELECT fcm_token FROM users WHERE user_id = ?',
                [
                    post_owner_id
                ],
                (error, result) => {
                    if(!error) {
                        let peerToken = result[0].fcm_token;

                        var payload = {
                            notification: {
                                body: `${username} commented on your post`,
                                title: "V Chat App"
                            },
                            data: {
                                id: `${entity_id}`,
                                post_owner_id: `${post_owner_id}`,
                                screen: "comment",
                                'click_action': 'FLUTTER_NOTIFICATION_CLICK',
                            }
                        };
                        var options = {
                            priority: "high",
                            timeToLive: 60 * 60 * 24
                        };

                        admin
                            .messaging()
                            .sendToDevice(peerToken, payload, options)
                            .then(function (ress) {

                            })
                            .catch(function (err) {
                                console.log("error is " + err);
                            });

                        conn.query(
                            'INSERT INTO notifications(notif_id,username,title,entity_id,entity_owner_id,notif_creator_id) VALUES(?,?,?,?,?,?)',
                            [
                                uuidv4().replace(/-/g, ''),
                                username,
                                'commented on your post',
                                entity_id,
                                post_owner_id,
                                user_id
                            ],
                            (error, result) => {
                                if(error) {
                                    res.status(500).send({
                                        "error": true,
                                        "data": error
                                    });
                                }
                                else {
                                    res.status(201).send({
                                        "error": false,
                                        "data": {
                                            "comment_id": comment_id,
                                        }
                                    });
                                }
                            }
                        );
                    }
                }
            );
        }
    },
    deleteComment: async (req, res) => {
        const {comment_id,entity_type,entity_id} = req.body;

        conn.query(
            'DELETE FROM comments WHERE comment_id = ?',
            [
                comment_id
            ],
            (error, result) => {
                if(error) {
                    res.status(500).send({
                        "error": true,
                        "data": error
                    });
                }
            }
        );

        conn.query(
            'UPDATE ?? SET comments_count=comments_count-1 WHERE ?? = ?',
            [
                entity_type + 's',
                entity_type + '_id',
                entity_id
            ],
            (error, result) => {
                if(error) {
                    res.status(500).send({
                        "error": true,
                        "data": error
                    });
                }
                else {
                    res.status(200).send({
                        "error": false,
                        "data": "none"
                    })
                }
            }
        );
    },
    getComments: async (req, res) => {
        const {entity_type,entity_id} = req.body;

        conn.query(
            'SELECT c.`comment_id`,c.`user_id`,c.`descr`,u.`username`,u.`profile_pic` FROM `comments` c, `users` u \
             WHERE c.`user_id` = u.`user_id` AND entity_type = ? AND entity_id = ?',
            [
                entity_type,
                entity_id
            ],
            (error, result) => {
                if(error) {
                    res.status(500).send({
                        "error": true,
                        "data": error
                    });
                }
                else {
                    res.status(200).send({
                        "error": false,
                        "data": result
                    })
                }
            }
        );
    }
};
