const pg = require('pg');
const connectionString = process.env.databaseURL || "postgres://postgres:dell@localhost:5432/coronadb";
const client = new pg.Client(connectionString);
client.connect();

module.exports = client;