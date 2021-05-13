const
    bcrypt = require('bcrypt'),
    Hash = passcode => bcrypt.hash(`'${passcode}'`,10, err => console.log(err)),
    Compare = (passcode,hash) => bcrypt.compare(`${passcode}`,hash, err => console.log(err))

module.exports = Hash;
module.exports = Compare;