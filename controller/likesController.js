"use strict";

var admin = require("firebase-admin");

const conn = require('../dbconfig/mysql.service.js');
const uuidv4 = require('uuid').v4;
const moment = require('moment');

module.exports = {
    createLike: async (req, res) => {
        const {user_id,entity_type,entity_id,username,post_owner_id} = req.body;

        conn.query(
            'INSERT INTO likes VALUES(?,?,?,?,?)',
            [
                uuidv4().replace(/-/g, ''),
                entity_type,
                entity_id,
                user_id,
                moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')
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
            'UPDATE ?? SET likes = json_insert(`likes`,?,?), likes_count = json_length(`likes`) WHERE ?? = ?',
            [
                entity_type + 's',
                '$.\"'+user_id+'\"',
                user_id,
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
                                body: `${username} has liked your post`,
                                title: "V Chat App"
                            },
                            data: {
                                id: `${entity_id}`,
                                post_owner_id: `${post_owner_id}`,
                                screen: "like",
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
                                'has liked your post',
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
                                        "data": "none"
                                    });
                                }
                            }
                        );
                    }
                }
            );
        }
        else {
            res.status(201).send({
                "error": false,
                "data": "none"
            });
        }
    },
    deleteLike: async (req, res) => {
        const {user_id,entity_type,entity_id} = req.body;

        conn.query(
            'DELETE FROM likes WHERE user_id=? AND entity_type=? AND entity_id=?',
            [
                user_id,
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
            }
        );

        conn.query(
            'UPDATE ?? SET `likes` = json_remove(`likes`,?), `likes_count` = json_length(likes) WHERE ?? = ?',
            [
                entity_type + 's',
                '$.\"'+user_id+'\"',
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
                    });
                }
            }
        )
    }
};
