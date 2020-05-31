"use strict";
//created by Hatem Ragap
const conn = require('../dbconfig/mysql.service.js');

module.exports = {
    getNotifications: async (req, res) => {
        const {user_id} = req.body;

        conn.query(
            'SELECT notif_id,username,title,profile_pic,entity_id,entity_owner_id,notif_creator_id,UNIX_TIMESTAMP(created_at) as timestamp \
             FROM notifications WHERE entity_owner_id = ?',
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
                    res.status(200).send({
                        "error": true,
                        "data": "No notifications yet!"
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
};
