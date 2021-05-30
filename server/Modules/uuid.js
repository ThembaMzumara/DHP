const
    { v4 : uuidv4 } = require('uuid'),
    unique_id = uuidv4().split('-',1);

module.exports = unique_id;