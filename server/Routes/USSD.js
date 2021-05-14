let response, chunk, inputs;
const
    express = require('express'),
    bcrypt = require('bcrypt'),
    client = require('../Modules/database'),
    SendMessage = require('../Modules/twilio'),
    unique_id = require('../Modules/uuid'),
    router = express.Router();

router

    .get('/', async (req,res)=>  await res.send(`USSD RUNNING`) )

    .post('/', async (req,res)=>{
        const { phoneNumber, text } = req.body

            if ( text === '' ) response = `CON Welcome to Digital Health Passport Mobile View. Select your action \n\n 1. View Information \n 2. Generate Random Password \n 3. Register`

            if ( text !== '' ){
                inputs = text.split('*')
                    if ( inputs.length === 0 ) response = `END An Error Occurred`
                    else if ( inputs.length > 0 ){
                        if ( parseInt( inputs[0] ) === 1 ){
                            chunk = await client.query( `SELECT * FROM users`)
                                await chunk.rows.forEach( (User)=>{
                                    if (phoneNumber === User.phonenumber){
                                        response = `CON 1. View Medical Information \n 2. View/Edit Personal Information`
                                            if (inputs.length === 2){
                                                if ( parseInt( inputs[1] ) === 1){
                                                    response = `CON Enter your password.`
                                                        if (inputs.length === 3){
                                                            bcrypt.compare(`${inputs[2]}`, `${User.password}`, (err,result) =>{
                                                                if (err) console.log(err)
                                                                else {
                                                                    if (result){}
                                                                    else if (!result){}
                                                                    else response = `END An Error Occurred.`
                                                                }
                                                            })
                                                        } else response = `END An Error occurred`
                                                } else if ( parseInt( inputs[1] ) === 2){
                                                    response = `CON Enter your password.`
                                                        if (inputs.length === 3){
                                                            bcrypt.compare(`${inputs[2]}`, `${User.password}`, (err,result) =>{
                                                                if (err) console.log(err)
                                                                else {
                                                                    if (result){}
                                                                    else if (!result){}
                                                                    else response = `END An Error Occurred.`
                                                                }
                                                            })
                                                        } else response = `END An Error occurred`
                                                }
                                            }
                                    } else if (phoneNumber !== User.phonenumber) response = `END ${phoneNumber} is not a registered user.`
                                        else response = `END An error occurred.`
                                })
                        }
                        else if ( parseInt( inputs[0] ) === 2 ){
                            chunk = await client.query( `SELECT * FROM users`)
                                chunk.rows.forEach((User)=>{
                                    if (phoneNumber === User.phonenumber){
                                        response = `CON Enter your password.`
                                            if ( inputs.length === 2 ){
                                                bcrypt.compare(`${inputs[1]}`, `${User.password}`, (err, result) =>{
                                                    if (err) console.log(err)
                                                    else {
                                                        if (result){
                                                            SendMessage(`Your generated Password is: ${unique_id[0]}`,`${phoneNumber}`)
                                                            response = `END Your Generated Password is \n ${unique_id[0]}. A copy has been sent to ${phoneNumber} Via SMS.`
                                                        } else if (!result) response = `END password Mismatch.`
                                                            else response = `END An error occurred.`
                                                    }
                                                })
                                            }
                                    } else if (phoneNumber !== User.phonenumber) response = `END ${phoneNumber} is not a registered user.`
                                        else response = `END An error occurred.`
                                })
                        } else if ( parseInt( inputs[0] ) === 3 ){
                            chunk = await client.query( `SELECT * FROM users`)
                                await chunk.rows.forEach((User)=>{
                                    if (phoneNumber === User.phonenumber) response = `END ${phoneNumber} is already registered.`
                                    else if (phoneNumber !== User.phonenumber){
                                        response = `CON Enter Your name to be registered under ${phoneNumber}`
                                            if (inputs.length === 2 ){
                                                SendMessage(`${inputs[1]} your registration is successful. Your 4 digit password is ${unique_id[1]}. Editing your password is possible.`,`${phoneNumber}`)
                                                bcrypt.hash(`${unique_id}`,10, (err, result) => err ? console.log(err) :
                                                    client.query( `INSERT INTO users(id, phoneNumber, fullName, password) VALUES(DEFAULT, '${phoneNumber}', '${inputs[1]}', '${result}')`, err => console.log(err))
                                                )
                                                response = `END ${phoneNumber} has been registered under ${inputs[1]}.`
                                            } else response = `END An Error Occurred.`
                                    } else response = `END An Error occurred.`
                                })
                        } else response = `END An Error Occurred.`
                    }
            }

        setTimeout(()=>{ res .send(response) .end() },4000)
    })

module.exports = router;