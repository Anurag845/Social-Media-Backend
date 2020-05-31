"use strict";
//created by Hatem Ragap
const Joi = require('joi');
const passwordHash = require("password-hash");
const {userSchemaModel} = require('../models/userModel');
const {postSchemaModel} = require('../models/postsModel');
const {likeSchemaModel} = require('../models/likesModel');
const {commentSchemaModel} = require('../models/commentsModel');

const conn = require('../dbconfig/mysql.service.js');
const crypto = require('crypto');
const moment = require('moment');
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWTSECRET;
const uuidv4 = require('uuid').v4;

module.exports = {

    createUser: async (req, res) => {
        const {email,username,password,first_name,last_name,display_name,birth_date,profile_about,
            profile_pic,profile_status,created_at,updated_at} = req.body;

        conn.query(
            'SELECT COUNT(*) as count FROM users WHERE email = ?',
            [
                email
            ],
            (error, result) => {
                if(result[0].count == 1) {
                    res.status(400).send({
                        "error": true,
                        "data": "User with email already exists."
                    });
                }
            }
        );
        let salt = crypto.randomBytes(16).toString('base64');
        let hash = crypto.createHmac('sha512', salt).update(password).digest("base64");
        var hashedpassword = salt + "$" + hash;
        let token = jwt.sign(req.body, jwtSecret);
        conn.query(
            'INSERT INTO users(user_id,username,email,password,first_name,last_name,display_name,birth_date, \
             profile_pic,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)',
            [
                uuidv4().replace(/-/g, ''),
                username,
                email,
                hashedpassword,
                first_name,
                last_name,
                display_name,
                birth_date,
                profile_pic,
                moment(Date.now()).format('YYYY-MM-DD HH:mm:ss'),
                moment(Date.now()).format('YYYY-MM-DD HH:mm:ss')
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
                        "data": {}
                    });
                }
            }
        );
    },
    loginUser: async (req, res) => {
        let token = jwt.sign(req.body, jwtSecret);
        res.status(200).send({
            "error": false,
            "data": {
                "user_id": req.body.user_id,
                "email": req.body.email,
                "username": req.body.username,
                "first_name": req.body.first_name,
                "last_name": req.body.last_name,
                "display_name": req.body.display_name,
                "birth_date": req.body.birth_date,
                "profile_about": req.body.profile_about,
                "profile_pic": req.body.profile_pic,
                "accessToken": token
            },
        });
    },
    getUser: async (req, res) => {
        const user_id = req.body.user_id;

        conn.query(
            'SELECT username,first_name,last_name,display_name,profile_pic,profile_about,birth_date \
             FROM users WHERE user_id = ?',
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
                else {
                    res.status(200).send({
                        "error": false,
                        "data": result[0]
                    });
                }
            }
        );
    },
    getUserByEmail: async (req, res) => {
        const email = req.body.email;

        conn.query(
            'SELECT user_id,username,email,display_name,profile_about,profile_pic FROM users WHERE email = ?',
            [
                email
            ],
            (error, result) => {
                if(error) {
                    res.status(500).send({
                        "error": true,
                        "data": error
                    });
                }
                else if(result.length == 0) {
                    res.status(200).send({
                        "error": true,
                        "data": "No user matched!"
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
    getUsers: async (req, res) => {

        conn.query(
            'SELECT email,username,display_name,profile_about,profile_pic FROM users',
            [],
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
    get_likes_posts_comments_counts: async (req, res) => {
        const {user_id} = req.body;
        var postsCount = 0;
        var likesCount = 0;
        var commentsCount = 0;

        conn.query(
            'SELECT COUNT(*) as postsCount FROM posts WHERE user_id = ?',
            [
                user_id
            ],
            (error, result) => {
                if(!error) {
                    postsCount = result[0].postsCount;
                }
                else {
                    res.status(500).send({
                        "error": true,
                        "data": error
                    });
                }
            }
        );

        conn.query(
            'SELECT COUNT(*) as likesCount FROM likes WHERE user_id = ?',
            [
                user_id
            ],
            (error, result) => {
                if(!error) {
                    likesCount = result[0].likesCount;
                }
                else {
                    res.status(500).send({
                        "error": true,
                        "data": error
                    });
                }
            }
        );

        conn.query(
            'SELECT COUNT(*) as commentsCount FROM comments WHERE user_id = ?',
            [
                user_id
            ],
            (error, result) => {
                if(!error) {
                    commentsCount = result[0].commentsCount;
                    res.status(200).send({
                        "error": false,
                        "posts": postsCount,
                        "comments": commentsCount,
                        "likes": likesCount
                    });
                }
                else {
                    res.status(500).send({
                        "error": true,
                        "data": error
                    });
                }
            }
        );
    },
    addUserImg: async (req, res) => {


        let user_id = req.body.user_id;
        let name = req.file.filename;
        let bio = req.body.bio;
        if(bio){
            await userSchemaModel.findByIdAndUpdate(user_id, {img: name, bio: bio}).exec((err) => {
                if (err) res.send({error: true, data: 'err' + err});
                else res.send({error: false, data: name});
            });
        }else{
            await userSchemaModel.findByIdAndUpdate(user_id, {img: name}).exec((err) => {
                if (err) res.send({error: true, data: 'err' + err});
                else res.send({error: false, data: name});
            });
        }
    },
    update_bio: async (req, res) => {
        let user_id = req.body.user_id;
        let bio = req.body.bio;
        const user = await userSchemaModel.findByIdAndUpdate(user_id, {bio: bio}).exec((err) => {
            if (err) res.send({error: true, data: 'err' + err});
            else res.send({error: false, data: user});
        });
    },
    update_bio_and_name: async (req, res) => {
        let user_id = req.body.user_id;
        let bio = req.body.bio;
        let user_name = req.body.user_name;
        await userSchemaModel.findByIdAndUpdate(user_id, {bio: bio, user_name: user_name}).exec((err) => {
            if (err) res.send({error: true, data: 'err' + err});
            else res.send({error: false, bio: bio, user_name: user_name});
        });
    },
    updateName: async (req, res) => {
        const {user_id, first_name, last_name, display_name} = req.body;

        conn.query(
            'UPDATE users SET first_name = ?, last_name = ?, display_name = ? WHERE user_id = ?',
            [
                first_name,
                last_name,
                display_name,
                user_id
            ],
            (error, result) => {
                if(error) {
                    res.status(500).send({
                        "error": error
                    });
                }
                else {
                    res.status(200).send({
                        "status": success
                    });
                }
            }
        );
    },
    updatePassword: async (req, res) => {
        const {user_id, password} = req.body;

        let salt = crypto.randomBytes(16).toString('base64');
        let hash = crypto.createHmac('sha512', salt).update(password).digest("base64");
        var hashedpassword = salt + "$" + hash;
        let token = jwt.sign(req.body, jwtSecret);

        conn.query(
            'UPDATE users SET password = ? WHERE user_id = ?',
            [
                hashedpassword,
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
                        "status": "success",
                        "accessToken": token
                    });
                }
            }
        );
    },
    updateAndAddUserToken: async function (req, res) {
        if (req.body.user_id && req.body.token) {
            const {user_id,token} = req.body;

            conn.query(
                'UPDATE users SET fcm_token = ? WHERE user_id = ?',
                [
                    token,
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
                            "data": "done"
                        });
                    }
                }
            );
        }
        else {
            res.status(500).json({
                error: false,
                data: ' user id is required ! or token '
            });
        }
    },
};


function createUserValidation(user) {
    const schema = Joi.object().keys({
        user_name: Joi.string().min(5).max(30).required(),
        email: Joi.string().email({minDomainAtoms: 2}).max(30).required(),
        password: Joi.string().min(6).max(30).required(),
    });
    return Joi.validate(user, schema);
}

function updatePasswordValidation(user) {
    const schema = Joi.object().keys({
        user_id: Joi.string().required(),
        old_password: Joi.string().min(6).max(30).required(),
        new_password: Joi.string().min(6).max(30).required(),
    });
    return Joi.validate(user, schema);
}

function loginUserValidation(user) {
    const schema = Joi.object().keys({
        email: Joi.required(),
        password: Joi.required(),
    });
    return Joi.validate(user, schema);
}

function idValidation(id) {
    const schema = Joi.object().keys({
        user_id: Joi.required(),
    });
    return Joi.validate(id, schema);
}
