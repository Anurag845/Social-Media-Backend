"use strict";

const conn = require('../dbconfig/mysql.service.js');

module.exports = {
    getMessages: async (req, res, next) => {
        const {user_id,conversation_id} = req.body;

        conn.query(
            'SELECT m.conversation_id, m.created_at, m.sender_id, u.display_name, u.profile_pic, m.message, m.attachments \
             FROM messages m, users u, participants p \
             WHERE p.user_id = ? \
             AND m.conversation_id = ? \
             AND u.user_id = m.sender_id \
             AND p.conversation_id = m.conversation_id \
             ORDER BY m.created_at DESC \
             LIMIT 20 OFFSET 0',
            [
                user_id,
                conversation_id
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
                        "data": "No messages"
                    });
                }
                else {
                    result.forEach(record => {
                        if(record.attachments == '{}') {
                            record.message_type = 0;
                            record.image = '';
                        }
                        else {
                            record.message_type = 1;
                            record.image = JSON.parse(record.attachments).name;
                        }
                    });
                    res.status(200).send({
                        "error": false,
                        "data": result
                    });
                }
            }
        );
    },
    deleteMessage: async (req, res) => {
        const {message_id,user_id} = req.body;

        //INSERT INTO deleted_messages
        //REMOVE FROM messages
    },
    uploadImage: async (req, res) => {
        let imageName = req.file.filename;
        res.status(201).send({error: false, data: imageName});
    }
};
