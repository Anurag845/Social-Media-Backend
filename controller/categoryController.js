"use strict";

const conn = require('../dbconfig/mysql.service.js');

module.exports = {
    getCategories: async (req, res) => {
        conn.query(
            'SELECT * FROM categories LIMIT 8',
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
                        "status": "success",
                        "data": result
                    });
                }
            }
        );
    }
}
