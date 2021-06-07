let response, inputs;
const
    express = require('express'),
    // bcrypt = require('bcrypt'),
    client = require('../Modules/database'),
    SendMessage = require('../Modules/twilio'),
    unique_id = require('../Modules/uuid'),
    router = express.Router();

router

    .get('/', async (req,res) => await res.send(`USSD SERVER RUNNING...`) )

    .post('/', async (req,res) => {
        const { phoneNumber, text } = req.body

            if ( text === '' ) await DisplayHomeScreen(phoneNumber)

            if ( text !== '' ){
                inputs = text.split('*')
                    inputs.length > 0 ?
                        parseInt(inputs[0]) === 1 ? await UserInformation(phoneNumber) : parseInt(inputs[0]) === 2 ? await GenerateRandomPassword(phoneNumber) : response = `END Invalid Input.`
                    : response = `END No Input Found. Please Select An Option.`
            }

        setTimeout(() =>{ res.send(response).end() },4000)
    })

module.exports = router;

const
    DisplayHomeScreen = async Phonenumber =>{
        await client.query(`SELECT * FROM users WHERE phonenumber = '${Phonenumber}'`, (err, result) => {
            err ? console.log(err) :
                result.rows.forEach( User => {
                    User.length !== 0 ?
                        Phonenumber === User.phonenumber ? response = `CON Welcome to Digital Health Passport Mobile View. Select your action. \n\n 1. View and Edit User Information. \n 2. Generate Random Password.` : response = `END Unknown Error.`
                    : response = `END ${Phonenumber} is not a registered user.`
                })
        })
    },
    UserInformation = async Phonenumber =>{
        response = `CON 1. View Medical History. \n 2. View Personal Information. \n 3. Edit PIN.`
            if (inputs.length > 0){
                if (parseInt(inputs[1]) === 1) await DisplayMedicalHistory(Phonenumber)
                    else if (parseInt(inputs[1]) === 2) await DisplayUserData(Phonenumber)
                        else if (parseInt(inputs[1]) === 3) await UpdatePIN(Phonenumber)
            }
    },
    DisplayMedicalHistory = async Phonenumber =>{
        response = `CON Enter Your PIN.`
            if (inputs.length > 2) await client.query(`SELECT * FROM users WHERE phonenumber = '${Phonenumber}'`, (err, result) =>{
                err ? console.log(err) :
                    result.rows.forEach( User => parseInt(inputs[2]) === parseInt(User.password) ? response = `END User Data.` : parseInt(inputs[2]) !== parseInt(User.password) ? response = `END PIN MisMatch.` : response = `END Unknown Error.`)
            })
    },
    DisplayUserData = async Phonenumber =>{
        response = `CON Enter Your Pin`
            if (inputs.length > 2) await client.query(`SELECT * FROM users WHERE phonenumber = '${Phonenumber}'`, (err, result) =>{
                err ? console.log(err) :
                    result.rows.forEach( User => parseInt(inputs[2]) === parseInt(User.password) ? response = `END ${Phonenumber} is registered under ${User.fullname} born on DOB stays at LOCATION.` : parseInt(inputs[2]) !== parseInt(User.password) ? response = `END PIN MisMatch.` : response = `END Unknown Input.`)
            })
    },
    GenerateRandomPassword = async Phonenumber =>{
        response = `CON Enter Your PIN.`
            if (inputs.length > 1){
                await client.query(`SELECT * FROM users WHERE phonenumber = '${Phonenumber}'`, (err, result) =>{
                    err ? console.log(err) :
                        result.rows.forEach( User =>{
                            if (parseInt(inputs[1]) === parseInt(User.password)) {
                                SendMessage(`Your Requested Temporary password is ${unique_id}.`,`'${Phonenumber}'`)
                                    response = `END Your Generated password is ${unique_id}. A copy has been sent to ${Phonenumber} via SMS.`
                            } else if (parseInt(inputs[1]) !== parseInt(User.password)) response = `END PIN MisMatch.`
                        })
                })
            }
    },
    UpdatePIN = async Phonenumber =>{
        response = `CON Enter Your Current PIN.`
            if (inputs.length > 2){
                await client.query(`SELECT * FROM users WHERE phonenumber = '${Phonenumber}'`, (err, result) =>{
                    err ? console.log(err) :
                        result.rows.forEach( User =>{
                            if (parseInt(inputs[2]) === parseInt(User.password)){
                                response = `CON Enter Your New PIN.`
                                    if (inputs.length > 3){
                                        if (parseInt(inputs[3].length) >= 4){
                                            client.query(`UPDATE users SET password = '${inputs[3]}' WHERE phonenumber = '${Phonenumber}'`, err =>{
                                                if (err) console.log(err)
                                                    else {
                                                        SendMessage(`PIN updated successfully. Your New PIN is ${inputs[3]}.`,`${Phonenumber}`)
                                                            response = `END PIN Updated successfully. Your New PIN has been Sent to ${Phonenumber} via SMS.`
                                                    }
                                            })
                                        } else if (parseInt(inputs[3].length) < 4) response = `END New PIN does not fit requirements. Try Again.`
                                    }
                            } else if (parseInt(inputs[2]) !== parseInt(User.password)) response = `END PIN MisMatch`
                        })
                })
            }
    };