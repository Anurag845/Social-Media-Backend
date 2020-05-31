"use strict";

const conn = require('../dbconfig/mysql.service.js');

module.exports = {
    createGroup: async (req, res) => {
        const {group_name,user_id} = req.body;

        conn.query(
            'INSERT INTO groups(group_id,group_name,created_at,owner_id) VALUES(?,?,?,?)',
            [
                uuidv4().replace(/-/g, ''),
                group_name,
                moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
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
    getGroupChats: async (req, res) => {
        conn.query(
            'SELECT group_id as chat_id,group_name as chat_name,? as chat_img,conversation_id,created_at FROM `groups`',
            [
                'default-chat-room-image.jpg'
            ],
            (error, result) => {
                if(error) {
                    res.status(500).send({
                        "error": true,
                        "data": error
                    });
                }
                else if(result.length === 0) {
                    res.status(200).send({
                        "error": true,
                        "data": "No groups yet!"
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
    getUserGroups: async (req, res) => {
        const {user_id} = req.body;

        conn.query(
            'SELECT g.group_id,g.category_id,g.group_name,g.created_at,g.owner_id,g.descr,g.group_status,g.conversation_id FROM `groups` g, participants p \
             WHERE p.user_id = ? and p.conversation_id = g.conversation_id',
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
        )
    },
    getPersonalChats: async (req, res) => {
        const {user_id} = req.body;

        conn.query(
            'SELECT u.user_id as chat_id,r.conversation_id,u.username as chat_name,u.profile_pic as chat_img,r.created_at \
             FROM user_relations r, users u \
             WHERE r.user_id = ? AND r.friend_id = u.user_id',
            [
                user_id,
            ],
            (error, result) => {
                if(error) {
                    res.status(500).send({
                        "error": true,
                        "data": error
                    });
                }
                else if(result.length === 0) {
                    res.status(200).send({
                        "error": true,
                        "data": "Not found"
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
    deleteGroup: async (req, res) => {
        const {group_id} = req.body;

        conn.query(
            'DELETE FROM groups WHERE group_id = ?',
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
                        "data": "done"
                    });
                }
            }
        );
    },
    deletePersonalChat: async (req, res) => {

    }
}
