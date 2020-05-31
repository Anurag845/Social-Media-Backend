"use strict";

const conn = require('../dbconfig/mysql.service.js');
const uuidv4 = require('uuid').v4;
const moment = require('moment');

module.exports = {

    createPost: async (req, res) => {
        const {user_id, descr} = req.body;
        let post_id = uuidv4().replace(/-/g, '');
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
            'INSERT INTO posts(post_id,created_at,user_id,descr,attachments,likes_count,comments_count,visibility,likes) \
             VALUES(?,?,?,?,?,?,?,?,?)',
            [
                post_id,
                created_at,
                user_id,
                descr,
                JSON.stringify(attachments),
                0,
                0,
                5,
                '{}'
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
                            "descr": descr,
                            "likes_count": 0,
                            "comments_count": 0,
                            "user_id": user_id,
                            "created_at": created_at,
                            "post_id": post_id,
                            "attachments": attachments
                            //"has_attachment": has_attachment,
                            //"attachment_name": attachment_name,
                        }
                    });
                }
            }
        );
    },
    getPosts: async (req, res) => {
        const {user_id,offset} = req.body;

        conn.query(
            'SELECT p.`post_id`,p.`created_at`,p.`user_id`,p.`descr`,p.`likes_count`,p.`comments_count`,UNIX_TIMESTAMP(p.`created_at`) as timestamp, \
             u.`username`,u.`profile_pic`,json_length(p.`attachments`) as no_attachments,p.`attachments`,p.`likes`->\'$.*\' as usersLiked FROM `posts` p, `users` u \
             WHERE p.`user_id` = u.`user_id` ORDER BY p.`created_at` DESC LIMIT 20 OFFSET ?',
            [
                parseInt(offset)
            ],
            (error, result) => {
                if(error) {
                    res.status(500).send({
                        "error": true,
                        "data": error
                    });
                }
                if(result.length === 0) {
                    res.status(200).send({
                        "error": true,
                        "data": "No posts"
                    });
                }
                else {
                    result.forEach(record => {
                        record.isUserLiked = record.usersLiked == null ? false : record.usersLiked.includes(user_id);
                    });
                    res.status(200).send({
                        "error": false,
                        "data": result
                    });
                }
            }
        );
    },
    fetch_posts_by_user_id: async (req, res) => {
        const {peer_id,user_id} = req.body;

        conn.query(
            'SELECT p.`post_id`,p.`created_at`,p.`user_id`,p.`descr`,p.`likes_count`,p.`comments_count`,UNIX_TIMESTAMP(p.`created_at`) as timestamp, \
             u.`username`,u.`profile_pic`,json_length(p.`attachments`) as no_attachments,p.`attachments`,p.`likes`->\'$.*\' as usersLiked FROM `posts` p, `users` u \
             WHERE p.`user_id` = u.`user_id` AND p.`user_id` = ?',
             [
                 peer_id
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
                         "data": "No posts"
                     });
                 }
                 else{
                     result.forEach(record => {
                         record.isUserLiked = record.usersLiked == null ? false : record.usersLiked.includes(user_id);
                     });
                     res.status(200).send({
                         "error": false,
                         "data": result
                     });
                 }
             }
        );
    },
    deletePost: async (req, res) => {
        const {post_id} = req.body;
        conn.query(
            'DELETE FROM posts WHERE post_id = ?',//Also delete likes and comments
            [
                post_id
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
            'DELETE FROM likes WHERE entity_type = ? AND entity_id = ?',
            [
                'post',
                post_id
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
            'DELETE FROM comments WHERE entity_type = ? AND entity_id = ?',
            [
                'post',
                post_id
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
        );
    },
    getPostById: async (req, res) => {
        const {user_id,post_id} = req.body;

        conn.query(
            'SELECT p.`post_id`,p.`created_at`,p.`user_id`,p.`descr`,p.`likes_count`,p.`comments_count`,UNIX_TIMESTAMP(p.`created_at`) as timestamp, \
             u.`username`,u.`profile_pic`,json_length(p.`attachments`) as no_attachments,p.`attachments`,p.`likes`->\'$.*\' as usersLiked FROM `posts` p, `users` u \
             WHERE p.`user_id` = u.`user_id` AND p.`post_id` = ?',
             [
                 post_id
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
                         "data": "Post not found"
                     });
                 }
                 else {
                     result.forEach(record => {
                         record.isUserLiked = record.usersLiked == null ? false : record.usersLiked.includes(user_id);
                     });
                     res.status(200).send({
                         "error": false,
                         "data": result[0]
                     });
                 }
             }
        );
    }
};
