const
    { Client } = require('pg'),
    client = new Client('postgres://Navee:0001@localhost/test');
    client.connect( err => err ? err : console.log(`DATABASE CONNECTION : ${!err}`) );

module.exports = client;