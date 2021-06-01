let response, chunk, inputs;
const
    express = require('express'),
    // bcrypt = require('bcrypt'),
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
                            response = `CON 1. View Medical History \n 2. View/Edit Personal Information`
                                if (inputs.length > 1){
                                    if (parseInt(inputs[1]) === 1){
                                        response = `CON Enter Your PIN.`
                                            if (inputs.length > 2){
                                                chunk = await client.query(`SELECT * FROM users WHERE phonenumber = '${phoneNumber}' `)
                                                    await chunk.rows.forEach((User)=>{
                                                        if (parseInt(inputs[2]) === parseInt(User.password)){
                                                            response = `END User Data`
                                                        } else if (parseInt(inputs[2]) !== parseInt(User.password)) response = `END PIN MisMatch.`
                                                    })
                                            }
                                    } else if (parseInt(inputs[1]) === 2){
                                        response = `CON Enter Your Pin`
                                            if (inputs.length > 2){
                                                chunk = await client.query(`SELECT * FROM users WHERE phonenumber = '${phoneNumber}' `)
                                                    await chunk.rows.forEach((User)=>{
                                                        if (parseInt(inputs[2]) === parseInt(User.password)){
                                                            response = `CON Your Full Name is ${User.fullname}. \n\n 1. Edit Full Name \n 2. Edit PIN`
                                                                if (inputs.length > 3){
                                                                    if (parseInt(inputs[3]) === 1){
                                                                        response = `CON Enter Your New Name.`
                                                                            if (inputs.length > 4){
                                                                                // if ()
                                                                            }
                                                                    } else if (parseInt(inputs[3]) === 2){
                                                                        response = `CON Enter Your Old PIN.`
                                                                        // TO FIX
                                                                            if (inputs.length > 4){
                                                                                if (parseInt(inputs[4]) === parseInt(inputs[2])){
                                                                                    response = `Enter Your New PIN.`
                                                                                        if (inputs.length > 5){
                                                                                            if (parseInt(inputs[4].length) >= 4){
                                                                                                client.query( `UPDATE user SET password = '${inputs[5]}' WHERE phonenumber = '${phoneNumber}'`, (err) =>{
                                                                                                    if (err) console.log(err)
                                                                                                    else {
                                                                                                        SendMessage(`PIN update is successful. Your New PIN is ${inputs[5]}.`,`${phoneNumber}`)
                                                                                                        response = `END PIn Update is successful. Your New PIN has been Sent to ${phoneNumber} via SMS.`
                                                                                                    }
                                                                                                })
                                                                                            } else if (parseInt(inputs[4].length) < 4) response = `END New PIN does not fit requirements. Try Again.`
                                                                                        }
                                                                                } else if (parseInt(inputs[4]) !== parseInt(inputs[2])) response = `END PIN MisMatch`
                                                                            }
                                                                    }
                                                                }
                                                        } else if (parseInt(inputs[2]) !== parseInt(User.password)) response = `END PIN MisMatch.`
                                                    })
                                            }
                                    }
                                }
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