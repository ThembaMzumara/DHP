const
    { Client } = require('pg'),
    client = new Client('postgres://Navee:0001@localhost/dhp');
    client.connect(err => err ? console.log(err) : console.log(`DATABASE CONNECTED : ${!err}`.toUpperCase()));

module.exports = client;