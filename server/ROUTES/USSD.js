let response, inputs;
const
    express = require('express'),
    // hash = require('md5'),
    client = require('../MODULES/database'),
    SendMessage = require('../MODULES/SMS'),
    unique_id = require('../MODULES/uuid'),
    router = express.Router();

router

    .get('/', async (req,res) => await res.send(`USSD SERVER RUNNING...`) )

    .post('/', async (req,res) =>{
        const { phoneNumber, text } = req.body

            if (text === '') await DisplayWelcomeScreen(phoneNumber)

            if (text !== ''){
                inputs = text.split('*')
                    if (inputs.length > 0) parseInt(inputs[0]) === 1 ? await DisplaySecondOptions(phoneNumber) : parseInt(inputs[0]) === 2 ? await GenerateRandomPassword(phoneNumber) : response = `END Invalid Input.`
            }
                setTimeout(() =>{ res.send(response).end() },4000)
    })

module.exports = router;

const
    DisplayWelcomeScreen = async Phonenumber => await client.query(`SELECT * FROM patienttable`, (err, result) =>{
        err ? console.log(err) : result.rows.forEach( User => Phonenumber === User.phonenumber ? response = `CON Welcome to Digital Health Passport Mobile View. Select your action. \n\n 1. View and Edit User Information. \n 2. Generate Random Password.` : response = `END ${Phonenumber} is not a registered user.`)} ),
    DisplaySecondOptions = async Phonenumber =>{
        response = `CON 1. View Medical History. \n 2. View Personal Information. \n 3. Edit PIN.`
            if (inputs.length > 0){
                if (parseInt(inputs[1]) === 1) await DisplayMedicalHistory(Phonenumber)
                    else if (parseInt(inputs[1]) === 2) await DisplayUserData(Phonenumber)
                        else if (parseInt(inputs[1]) === 3) await UpdatePIN(Phonenumber)
            }
    },
    DisplayMedicalHistory = async Phonenumber =>{
        response = `CON Enter Your PIN.`
            if (inputs.length > 2) await client.query(`SELECT * FROM patienttable WHERE phonenumber = '${Phonenumber}'`, (err, result) =>
                err ? console.log(err) : result.rows.forEach( User => parseInt(inputs[2]) === parseInt(User.patientpassword) ? response = `END Medical History.` :
                     parseInt(inputs[2]) !== parseInt(User.patientpassword) ? response = `END PIN MisMatch.` : response = `END Unknown Error.`) )
    },
    DisplayUserData = async Phonenumber =>{
        response = `CON Enter Your Pin`
            if (inputs.length > 2) await client.query(`SELECT * FROM patienttable WHERE phonenumber = '${Phonenumber}'`, (err, result) =>{
                err ? console.log(err) : result.rows.forEach( User => parseInt(inputs[2]) === parseInt(User.patientpassword) ? response = `END ${Phonenumber} is registered under \n Fullname: ${User.patientname} \n Sex: ${User.gender} \n Blood Group: ${User.bloodgroup.toUpperCase()} \n Location: ${User.locationcol} \n Date of Birth: ${User.date} .` :
                     parseInt(inputs[2]) !== parseInt(User.patientpassword) ? response = `END PIN MisMatch.` : response = `END Unknown Input.`) })
    },
    UpdatePIN = async Phonenumber =>{
        response = `CON Enter Your Current PIN.`
            if (inputs.length > 2) await client.query(`SELECT * FROM patienttable WHERE phonenumber = '${Phonenumber}'`, (err, result) =>{
                err ? console.log(err) : result.rows.forEach( User =>{
                    if (parseInt(inputs[2]) === parseInt(User.patientpassword)){
                        response = `CON Enter Your New PIN.`
                            if (inputs.length > 3){
                                if (parseInt(inputs[3].length) >= 4) client.query(`UPDATE patienttable SET patientpassword = '${inputs[3]}' WHERE phonenumber = '${Phonenumber}'`, err =>{
                                    if (err) console.log(err)
                                        else {
                                            SendMessage(`PIN updated successfully. Your New PIN is ${inputs[3]}.`,`${User.phoneNumber}`)
                                                response = `END PIN Updated successfully. Your New PIN has been Sent to ${User.phoneNumber} via SMS.`
                                        } })
                                else if (parseInt(inputs[3].length) < 4) response = `END New PIN does not fit requirements. Try Again.`
                            }
                    } else if (parseInt(inputs[2]) !== parseInt(User.patientpassword)) response = `END PIN MisMatch`
                })
            })
    },
    GenerateRandomPassword = async Phonenumber => await client.query(`SELECT * FROM patienttable WHERE phonenumber = '${Phonenumber}'`, (err, result) =>{
        err ? console.error(err) : result.rows.forEach( User => client.query(`SELECT * FROM sessiontable WHERE patientid = '${User.patientid}'`, (err,result) =>{
            err ? console.error(err) : result.rows.forEach( patient =>{
                if (patient.length === 0)  client.query(`SELECT * FROM randompassword WHERE patientid = '${User.patientid}'`, (err, result) =>{
                    err ? console.error(err) : result.rows.forEach( user =>{
                        if (user.length === 0) client.query(`INSERT INTO randompassword(randompasswordid, randompassword, patientid) VALUES(DEFAULT, '${unique_id}', '${User.patientid}')`, err =>{
                            if (err) console.error(err)
                                else {
                                    SendMessage(`Your Requested Temporary password is ${unique_id}.`,`'${User.phoneNumber}'`)
                                        response = `END Your Temporary password is ${unique_id}. A copy has been sent to ${User.phoneNumber} via SMS.`
                                } })
                        else if (user.length !== 0) client.query(`UPDATE randompassword SET randompassword = ${unique_id} WHERE patientid = ${user.patientid}`, err =>{
                            if (err) console.error(err)
                                else {
                                    SendMessage(`Your Temporary password has been updated to ${unique_id}`,`${User.phoneNumber}`)
                                        response = `END Your New Temporary password is ${unique_id}. A copy has been sent to ${User.phoneNumber} via SMS.`
                                } })
                    })
                })
                else if (patient.length !== 0) response = `END It appears ${User.phoneNumber} has an active Session.`
            })
        }) )
    });