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
                inputs = text.split('*')
                    chunk = await client.query(`SELECT * FROM users`)
                        await chunk.rows.forEach((User)=>{
                            if ( phoneNumber === User.phonenumber ){
                                response = `CON Welcome to Digital Health Passport Mobile View. Select your action \n 1. View Information \n 2. Generate Random Password`
                                    if ( inputs.length === 1 ){
                                        if ( parseInt(inputs[0]) === 1 ){
                                            response = `CON 1. View Medical History \n 2. View/Edit Personal Information`
                                                if ( inputs.length === 2 ){
                                                    if ( parseInt(inputs[1]) === 1 ){
                                                        response = `CON Enter Your Password.`
                                                            if ( inputs.length === 3 ){
                                                                bcrypt.compare(`${inputs[2]}`,User.password,err => {
                                                                    if (err) console.log(err)
                                                                    else response = `END ...`
                                                                })
                                                            }
                                                    } else if ( parseInt(inputs[1]) === 2 ){
                                                        response = `CON Enter Your Password.`
                                                            if ( inputs.length === 3 ){
                                                                bcrypt.compare(`${inputs[2]}`,User.password,err => {
                                                                    if (err) console.log(err)
                                                                    else response = `END ...`
                                                                })
                                                            }
                                                    } else if ( parseInt(inputs[1]) !== 1 || 2 ) response = `END Invalid Input.`
                                                    else response = `END An Error Occurred.`
                                                }
                                        } else if ( parseInt(inputs[0]) === 2 ){
                                            response = `CON Enter Your Password.`
                                                if ( inputs.length === 1 ){
                                                    bcrypt.compare(`${inputs[1]}`,User.password,err => {
                                                        if (err) console.log(err)
                                                        else {
                                                            SendMessage(`Your Generated Password is ${unique_id}`,`${phoneNumber}`)
                                                            response = `END Your Generated password is ${unique_id}. A copy has been sent to ${phoneNumber} via SMS.`
                                                        }
                                                    })
                                                }
                                        } else if ( parseInt(inputs[0]) !== 1 || 2 ) response = `END Invalid Input.`
                                        else response = `END An Error Occurred.`
                                    } else if ( inputs.length === 0 ) response = `END An Error Occurred.`
                            } else response = `END ${phoneNumber} is not a registered user.`
                        })
            }

        setTimeout(()=>{ res .send(response) .end() },4000)
    })

module.exports = router;