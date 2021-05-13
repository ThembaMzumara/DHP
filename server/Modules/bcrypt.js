const
    bcrypt = require('bcrypt'),
    Hash = password => bcrypt.hash(password,10, err => err ? console.log(err) : console.log(`Hashing Complete`)),
    Compare = password => bcrypt.compare(password,10, err => err ? console.log(err) : console.log(`Comparison Complete`))

module.exports = Hash;
module.exports = Compare;