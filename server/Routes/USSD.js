const
    express = require('express'),
    client = require('../Database'),
    router = express.Router();

router

    .get('/', async (req,res)=>{
        await client.query("", (err)=> err ? err : console.log(`QUERY EXECUTED: ${!err}`) )
        res.send("USSD RUNNING")
    })

module.exports = router;