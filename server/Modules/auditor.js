const
    client = require('./Database'),
    audit = async phoneNumber => {
        const chunk = await client.query(`SELECT * FROM users`)
            await chunk.rows.forEach((User)=>{
                if (phoneNumber !== User.phonenumber) console.log(`audit wasted time`.toUpperCase())
                else if (phoneNumber === User.phonenumber){
                    if (User.length === 1) console.log(`Only one account present for ${phoneNumber}.`.toUpperCase())
                    else if (User.length > 1){
                        for (let i = 0;i < User.length;i++){
                            client.query(`DELETE FROM users WHERE phonenumber = '${phoneNumber}' `,err => err ? console.log(err) : console.log(`Audit at your service`.toUpperCase()))
                        }
                    }
                }
            })
};

module.exports = audit;