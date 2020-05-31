var mysql = require('mysql');

var conn = mysql.createPool({
    connectionLimit: 100,
    host: "115.124.124.7",
    user: "nodeuser",
    password: "Node@123",
    database: "diaries"
});

/*var conn = mysql.createConnection({
    host: process.env.DBHOST,
    user: process.env.DBUSER,
    password: process.env.DBPASSWORD,
    database: process.env.DBNAME
});*/

/*conn.connect(function(err) {
    if (err) {
        throw err;
    }
    console.log("Connected to DB!");
});*/

module.exports = conn;
