let response, chunk, inputs;
const
    express = require('express'),
    bcrypt = require('bcrypt'),
    client = require('../Modules/database'),
    SendMessage = require('../Modules/twilio'),
    unique_id = require('../Modules/uuid'),
    router = express.Router();

router

    .get('/', async (req,res) =>  await res.send(`USSD SERVER RUNNING`) )

    .post('/', async (req,res) => {
        const { phoneNumber, text } = req.body

            if ( text === '' ){
                chunk = await client.query(`SELECT * FROM users`)
                    await chunk.rows.forEach((User)=>{
                        if ( phoneNumber === User.phonenumber ) response = `CON Welcome to Digital Health Passport Mobile View. Select your action. \n\n 1. View Information \n 2. Generate Random Password`
                        else if ( phoneNumber !== User.phonenumber ) response = `END ${phoneNumber} is not a registered user.`
                    })
            }

            if ( text !== '' ){
                inputs = text.split('*')
                    if (inputs.length > 0){
                        if (parseInt(inputs[0]) === 1){
                            response = `CON `
                        } else if (parseInt(inputs[0]) === 2){
                            response = `CON Enter Your PIN.`
                                chunk = await client.query(`SELECT * FROM users WHERE phonenumber = '${phoneNumber}' `)
                                    if (inputs.length > 1){
                                        await chunk.rows.forEach((User)=> {
                                            if (parseInt(inputs[1]) === parseInt(User.password)) {
                                                SendMessage(`Your Requested Temporary password is ${unique_id}.`,`${phoneNumber}`)
                                                response = `END Your Generated password is ${unique_id}. A copy has been sent to ${phoneNumber} via SMS.`
                                            } else if (parseInt(inputs[1]) !== parseInt(User.password)) response = `END PIN MisMatch.`
                                        })
                                    }
                        }
                    } else if (inputs.length === 0) response = `END Invalid Input.`
            }

        setTimeout(()=>{ res .send(response) .end() },4000)
    })

module.exports = router;