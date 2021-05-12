let response, chunk, inputs;
const
    express = require('express'),
    client = require('../Modules/Database'),
    SendMessage = require('../Modules/twilio'),
    unique_id = require('../Modules/uuid'),
    router = express.Router();

router

    .get('/', async (req,res)=> await res.send( `USSD RUNNING` ))

    .post('/', async (req,res)=>{
        const { phoneNumber, text } = req.body

            if ( text === '' ){
                response = `CON Welcome to Digital Health Passport Mobile View. Select your action \n\n 1. View Information \n 2. Generate Random Password \n 3. Register`
            }

            if ( text !== '' ){
                inputs = text.split('*')
                    if ( inputs.length === 0 ){
                        response = `END An Error Occurred`
                    } else if ( inputs.length > 0 ){
                        if ( parseInt( inputs[0] ) === 1 ){
                            response = `CON 1. View Medical Information \n 2. View/Edit Personal Information`
                        } else if ( parseInt( inputs[0] ) === 2 ){
                            chunk = await client.query( `SELECT * FROM users`)
                                chunk.rows.forEach((number)=>{
                                    if (phoneNumber === number.phonenumber){
                                        SendMessage(`Your generated Password is: ${unique_id[0]}`,`${phoneNumber}`)
                                        response = `END Your Generated Password is \n ${unique_id[0]}. A copy has been sent to ${phoneNumber} Via SMS.`
                                    } else if (phoneNumber !== number.phonenumber){
                                        response = `END ${phoneNumber} is not a registered user.`
                                    }
                                })
                        } else if ( parseInt( inputs[0] ) === 3 ){
                            chunk = await client.query( `SELECT * FROM users`)
                                chunk.rows.forEach((number)=>{
                                    if (phoneNumber === number.phonenumber){
                                        response = `END ${phoneNumber} is already registered.`
                                    } else if (phoneNumber !== number.phonenumber){
                                        response = `CON Enter Your name to be registered under ${phoneNumber}`
                                            if (inputs.length === 2 ){
                                                SendMessage(`${inputs[1]} your registration is successful`,`${phoneNumber}`)
                                                client.query( `INSERT INTO users(id, phoneNumber, fullName) VALUES(DEFAULT, '${phoneNumber}', '${inputs[1]}')` )
                                                    response = `END ${phoneNumber} has been registered under ${inputs[1]}.`
                                            }
                                    }
                                })
                        }
                        else response = `END An Error Occurred.`
                    }
            }
                // chunk.rows[0].


        setTimeout(()=>{ res .send(response) .end() },4000)
    })

module.exports = router;