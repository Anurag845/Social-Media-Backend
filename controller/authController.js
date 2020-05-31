const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWTSECRET;
const conn = require('../dbconfig/mysql.service');

exports.hasAuthValidFields = (req, res, next) => {
    let errors = [];

    if (req.body) {
        if (!req.body.email) {
            errors.push('Missing email field');
        }
        if (!req.body.password) {
            errors.push('Missing password field');
        }

        if (errors.length) {
            return res.status(400).send({
                error: true,
                data: errors.join(',')
            });
        }
        else {
            return next();
        }
    }
    else {
        return res.status(400).send({
          error: true,
          data: 'Missing email and password fields'
        });
    }
};

exports.isPasswordAndUserMatch = (req, res, next) => {

    conn.query(
        'SELECT user_id,username,email,password,first_name,last_name,display_name,birth_date,profile_about,profile_pic FROM users WHERE email = ?',
        [
            req.body.email
        ],
        (error,result) => {
            if(error) {
                res.status(500).send({
                    "error": true,
                    "data": error
                });
            }
            else if(result.length == 0) {
                res.status(404).send({
                    "error": true,
                    "data": "Email or password is incorrect"
                });
            }
            else {
                let passwordFields = result[0].password.split('$');
                let salt = passwordFields[0];
                let hash = crypto.createHmac('sha512', salt).update(req.body.password).digest("base64");
                if (hash === passwordFields[1]) {
                    req.body = {
                        user_id: result[0].user_id,
                        username: result[0].username,
                        email: result[0].email,
                        first_name: result[0].first_name,
                        last_name: result[0].last_name,
                        display_name: result[0].display_name,
                        birth_date: result[0].birth_date,
                        profile_about: result[0].profile_about,
                        profile_pic: result[0].profile_pic
                    };
                    return next();
                }
                else {
                    return res.status(400).send({
                        "error": true,
                        "data": ['Invalid e-mail or password']
                    });
                }
            }
        }
    );
};

exports.validJWTNeeded = (req, res, next) => {
    if (req.headers['authorization']) {
        try {
            let authorization = req.headers['authorization'].split(' ');
            if (authorization[0] !== 'Bearer') {
                return res.status(401).send();
            }
            else {
                req.jwt = jwt.verify(authorization[1], jwtSecret);
                return next();
            }
        }
        catch (err) {
            return res.status(403).send({
                "error": true,
                "data": err
            });
        }
    }
    else {
        return res.status(401).send({
            "error": true,
            "data": "You are not authorized"
        });
    }
};
