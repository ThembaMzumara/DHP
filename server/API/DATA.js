const
    express = require('express'),
    client = require('../MODULES/database'),
    router = express.Router();

router

    .get('/users', async (req,res) => await client.query(`SELECT * FROM patienttable`, (err, result) =>{ err ? console.error(err) : res.send(result.rows)}) )

    .get('/users/:id', async (req,res) => await client.query(`SELECT * FROM patienttable WHERE patientid = '${req.params.id}'`, (err, result) =>{ err ? console.error(err) : res.send(result.rows)}) )

    .get('/users/:fullname', async (req,res) => await client.query(`SELECT * FROM patienttable WHERE patientname = '${req.params.fullname}'`, (err, result) =>{ err ? console.error(err) : res.send(result.rows)}) )

    .get('/users/:phonenumber', async (req,res) => await client.query(`SELECT * FROM patienttable WHERE phonenumber = '${req.params.phonenumber}'`, (err, result) =>{ err ? console.error(err) : res.send(result.rows)}) )

module.exports = router;