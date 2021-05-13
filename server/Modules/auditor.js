const
    client = require('./database'),
    audit = async phoneNumber => {
        const chunk = await client.query(`SELECT * FROM users`)
            await chunk.rows.forEach((User)=>{
                if (phoneNumber !== User.phonenumber) console.log(`Audit run`.toUpperCase())
                else if (phoneNumber === User.phonenumber){
                    if (User.length === 1) console.log('Auditor found one user'.toUpperCase())
                    else if (User.length > 1){

                    }
                }
            })
    };

module.exports = audit;