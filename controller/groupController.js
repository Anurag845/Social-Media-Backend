"use strict";

const conn = require('../dbconfig/mysql.service.js');
const uuidv4 = require('uuid').v4;
const moment = require('moment');
var admin = require("firebase-admin");

module.exports = {
    createGroup: async (req, res) => {
        const {user_id,group_name} = req.body;

        let group_id = uuidv4().replace(/-/g, '');
        let timestamp = Date.now();
        let created_at = moment(timestamp).format('YYYY-MM-DD HH:mm:ss');
        let conversation_id = uuidv4().replace(/-/g, '');
        let descr = "About group";

        let groupImage;

        if(req.file) {
            groupImage = req.file.filename;
        }

        conn.query(
            'INSERT INTO `groups`(group_id,group_name,created_at,owner_id,descr,conversation_id,group_image) VALUES(?,?,?,?,?,?,?)',
            [
                group_id,
                group_name,
                created_at,
                user_id,
                descr,
                conversation_id,
                groupImage
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
            'INSERT INTO participants(conversation_id,user_id) VALUES(?,?)',
            [
                conversation_id,
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
                        "data": "done"
                    });
                }
            }
        );
    },
    getAllUserGroups: async (req, res) => {
        const {user_id} = req.body;

        conn.query(
            'SELECT g.group_id,g.category_id,g.group_name,g.created_at,g.owner_id,g.descr,g.group_status, \
             g.conversation_id,g.group_image FROM `groups` g, participants p \
             WHERE p.user_id = ? and p.conversation_id = g.conversation_id LIMIT 8',
             [
                 user_id
             ],
             (error, result) => {
                 if(error) {
                     res.status(500).send({
                         "error": true,
                         "data": error
                     });
                 }
                 else if(result.length === 0) {
                     res.status(500).send({
                         "error": true,
                         "data": "No groups"
                     });
                 }
                 else {
                     res.status(200).send({
                         "error": false,
                         "data": result
                     });
                 }
             }
        );
    },
    getUserGroupsbyCategory: async (req, res) => {
        const {user_id,category_id} = req.body;

        conn.query(
            'SELECT g.group_id,g.category_id,g.group_name,g.created_at,g.owner_id,g.descr,g.group_status, \
             g.conversation_id,g.group_image FROM `groups` g, participants p \
             WHERE p.user_id = ? AND p.conversation_id = g.conversation_id AND g.category_id = ? LIMIT 8',
             [
                 user_id,
                 category_id
             ],
             (error, result) => {
                 if(error) {
                     res.status(500).send({
                         "error": true,
                         "data": error
                     });
                 }
                 else if(result.length === 0) {
                     res.status(500).send({
                         "error": true,
                         "data": "No groups"
                     });
                 }
                 else {
                     res.status(200).send({
                         "error": false,
                         "data": result
                     });
                 }
             }
        );
    },
    getParticipants: async (req, res) => {
        const {group_id} = req.body;

        conn.query(
            'SELECT u.user_id,u.username,u.display_name,u.profile_pic FROM \
             users u, `groups` g, participants p \
             WHERE g.group_id = ? AND g.conversation_id = p.conversation_id AND p.user_id = u.user_id',
            [
                group_id
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
                    });
                }
            }
        );
    },
    getGroupInfo: async (req, res) => {
        const {group_id} = req.body;

        conn.query(
            'SELECT * FROM `groups` WHERE group_id = ?',
            [
                group_id
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
                        "data": result[0]
                    });
                }
            }
        );
    },
    getInviteList: async (req, res) => {
        const {user_id,group_id} = req.body;

        conn.query(
            'SELECT user_id, profile_pic, display_name \
            FROM users \
            WHERE user_id IN (SELECT friend_id FROM user_relations WHERE user_id = ?) \
            AND user_id NOT IN (SELECT user_id FROM group_members WHERE group_id = ?) \
            AND user_id NOT IN (SELECT invitee_id FROM group_invitations WHERE group_id = ? AND requestor_id = ?)',
            [
                user_id,
                group_id,
                group_id,
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
                    res.status(200).send({
                        "error": false,
                        "data": result
                    });
                }
            }
        );
    },
    invite: async (req, res) => {
        const {requestor_id,requestor_name,invitee_id,group_id} = req.body;

        conn.query(
            'INSERT INTO group_invitations(invitation_id,group_id,requestor_id,invitee_id) VALUES(?,?,?,?)',
            [
                uuidv4().replace(/-/g, ''),
                group_id,
                requestor_id,
                invitee_id
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

        /*conn.query(
            'SELECT fcm_token FROM users WHERE user_id = ?',
            [
                invitee_id
            ],
            (error, result) => {
                if(!error) {
                    let fcm_token = result[0].fcm_token;

                    var payload = {
                        notification: {
                            body: `${requestor_name} has invited you to join a group`,
                            title: "V Chat App"
                        },
                        data: {
                            group_id: `${group_id}`,
                            //post_owner_id: `${post_owner_id}`,
                            screen: "groups",
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
        );*/
        res.status(201).send({
            "error": false,
            "data": "none"
        });
    }
}
