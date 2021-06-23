let response, inputs;
const
    express = require('express'),
    hash = require('md5'),
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
                    if (inputs.length > 0)
                        parseInt(inputs[0]) === 1 ? await DisplaySecondOptions(phoneNumber) : parseInt(inputs[0]) === 2 ? await GenerateRandomPassword(phoneNumber) : parseInt(inputs[0]) === 3 ? await HelpData() : response = `END Invalid Input.`
            }
                setTimeout(() => res.send(response).end() ,4000)
    })

module.exports = router;

const
    DisplayWelcomeScreen = async Phonenumber => await client.query(`SELECT * FROM patienttable`, (err, result) =>{
        err ? console.error(err) : result.rows.forEach( User => Phonenumber === User.phonenumber ? response = `CON Welcome to Digital Health Passport Mobile View. Select your action. \n\n 1. View and Edit User Information. \n 2. Generate Random Password. \n 3. Help.` : response = `END ${Phonenumber} is not a registered user.`)} ),
    DisplaySecondOptions = async Phonenumber =>{
        response = `CON 1. View Medical History. \n 2. View Personal Information. \n 3. Edit PIN. `
            if (inputs.length > 1) parseInt(inputs[1]) === 1  ? await DisplayMedicalHistory(Phonenumber) : parseInt(inputs[1]) === 2 ? await DisplayUserData(Phonenumber) : parseInt(inputs[1]) === 3 ? await UpdatePIN(Phonenumber) : response = `END Invalid Option.`
    },
    DisplayMedicalHistory = async Phonenumber =>{
        response = `CON Enter Your PIN.`
            if (inputs.length > 2) await client.query(`SELECT * FROM patienttable WHERE phonenumber = '${Phonenumber}'`, (err, result) =>
                err ? console.error(err) : result.rows.forEach( User =>{
                    if (hash(parseInt(inputs[2])) === User.patientpassword){
                        response = `CON Please Select: \n 1. Last Medical Record \n 2. Previous 10 Medical Records \n 3. All Medical History.`
                            if (inputs.length > 3)
                                parseInt(inputs[3]) === 1 ? GetLastVisit(Phonenumber) : parseInt(inputs[3]) === 2 ? GetLastTenVisits(Phonenumber) : parseInt(inputs[3]) === 3 ? GetAllMedicalHistory() : response = `END Invalid Input. Try Again.`
                    } else if (hash(parseInt(inputs[2])) !== User.patientpassword) response = `END PIN MisMatch. \n Please Try Again.`
                })
            )
    },
    DisplayUserData = async Phonenumber =>{
        response = `CON Enter Your Pin`
            if (inputs.length > 2) await client.query(`SELECT * FROM patienttable WHERE phonenumber = '${Phonenumber}'`, (err, result) =>{
                err ? console.error(err) : result.rows.forEach( User => hash(parseInt(inputs[2])) === User.patientpassword ? response = `END ${Phonenumber} is registered under \n Fullname: ${User.patientname} \n Gender: ${User.gender} \n Blood Group: ${User.bloodgroup.toUpperCase()} \n Location: ${User.locationcol} \n Date of Birth: ${User.date} .` :
                     hash(parseInt(inputs[2])) !== User.patientpassword ? response = `END PIN MisMatch. \n Please Try Again.` : response = `END Unknown Input.`) })
    },
    UpdatePIN = async Phonenumber =>{
        response = `CON Enter Your Current PIN.`
            if (inputs.length > 2) await client.query(`SELECT * FROM patienttable WHERE phonenumber = '${Phonenumber}'`, (err, result) =>{
                err ? console.error(err) : result.rows.forEach( User =>{
                    if (hash(parseInt(inputs[2])) === User.patientpassword){
                        response = `CON Enter Your New PIN.`
                            if (inputs.length > 3){
                                if (parseInt(inputs[3].length) >= 4) client.query(`UPDATE patienttable SET patientpassword = '${hash(parseInt(inputs[3]))}' WHERE phonenumber = '${Phonenumber}'`, err =>{
                                    if (err) console.error(err)
                                        else {
                                            SendMessage(`PIN updated successfully. Your New PIN is ${inputs[3]}.`,`${Phonenumber}`)
                                                response = `END PIN Updated successfully. Your New PIN has been Sent to ${Phonenumber} via SMS.`
                                        } })
                                else if (parseInt(inputs[3].length) < 4) response = `END A minimum of 4 numbers is required to register a new PIN. Try Again.`
                            }
                    } else if (hash(parseInt(inputs[2])) !== User.patientpassword) response = `END PIN MisMatch. \n Please Try Again.`
                })
            })
    },
    HelpData = async () => response = `END Welcome to Your Mobile Personal Helper \n  \n For Further Help Call \n 1. +265 000 000 001. \n 2. +265 000 000 002.`,
    GetLastVisit = async Phonenumber => client.query(),
    GetLastTenVisits = async Phonenumber => client.query(),
    GetAllMedicalHistory = async Phonenumber => client.query(),
    GenerateRandomPassword = async Phonenumber => await client.query(`SELECT * FROM patienttable WHERE phonenumber = '${Phonenumber}'`, (err, result) =>{
        err ? console.error(err) : result.rows.forEach( User => client.query(`SELECT * FROM sessiontable WHERE patientid = '${User.patientid}'`, (err, result) =>{
            err ? console.error(err) : result.rows.forEach( Data =>{
                Data.length === 0 ? client.query(`SELECT * FROM randompassword WHERE patientid = '${User.patientid}'`, (err, result) =>{
                    !err ? console.error(`err2`) : result.rows.forEach( chunk =>{
                        response = `CON Enter Your PIN.`
                            if (inputs.length > 1){
                                if (hash(parseInt(inputs[1])) === User.patientpassword)
                                    chunk.length === 0 ? client.query(`INSERT INTO randompassword(randompasswordid, randompassword, patientid) VALUES(DEFAULT, '${unique_id}', '${User.patientid}')`, err =>{
                                        if (err) console.error(err)
                                            else {
                                                SendMessage(`Your Requested Temporary Password is '${unique_id}.`,`${Phonenumber}`)
                                                    response = `Your Temporary password is ${unique_id}. A copy has been sent to ${Phonenumber} Via SMS.`
                                            }
                                    }) : chunk.length !== 0 ? client.query(`UPDATE randompassword SET randompassword = '${unique_id}' WHERE patientid = '${User.patientid}`, err =>{
                                        if (err) console.error(err)
                                            else {
                                                SendMessage(`Your Requested Temporary Password has been changed to '${unique_id}.`,`${Phonenumber}`)
                                                    response = `Your New Temporary password is ${unique_id}. A copy has been sent to ${Phonenumber} Via SMS.`
                                            }
                                    }) : console.error(err)
                                else if (hash(parseInt(inputs[1])) !== User.patientpassword) response = `END PIN MisMatch. \n Please Try Again.`
                            } } )
                }) : Data.length !== 0 ? response = `END It appears ${Phonenumber} already has an active Session.` : console.error(err)
            })
        }) )
    })
    // ,GenerateRandomPassword = async Phonenumber =>{
    //     await client.query(`SELECT * FROM patienttable WHERE phonenumber = '${Phonenumber}'`, (err, result) =>{
    //         err ? console.log(err) :
    //             result.rows.forEach( User =>{
    //                 client.query(`SELECT * FROM randompassword WHERE patientid = ${User.patientid}`, (err,result) =>{
    //                     if (err) console.log(err)
    //                     else {
    //                         if (result.rows.length === 0){
    //                             response = `CON Enter Your PIN.`
    //                             if (inputs.length > 1){
    //                                 if (hash(parseInt(inputs[1])) === User.patientpassword) {
    //                                     client.query(`INSERT INTO randompassword(randompasswordid, randompassword, patientid) VALUES(1, '${unique_id}', '${User.patientid}')`, err => err ? console.log(err) :
    //                                         SendMessage(`Your Requested Temporary password is ${unique_id}.`,`'${Phonenumber}'`) )
    //                                     response = `END Your Temporary password is ${unique_id}. A copy has been sent to ${Phonenumber} via SMS.`
    //                                 } else if (parseInt(inputs[1]) !== parseInt(User.patientpassword)) response = `END PIN MisMatch.`
    //                             }
    //                         } else if (result.rows.length !== 0) response = `END Cannot Generate New Temporary Password Until Your Current Session is finished.`
    //                     }
    //                 })
    //             })
    //     })
    // }
;