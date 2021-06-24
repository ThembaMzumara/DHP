const
    client = require('twilio')('AC386aa3873e4968a65f97ea89b40f7821', 'dd9e4f635b1d25da6cf8e1f989403d3b'),
    SendMessage = async (messageBody, recipient) =>  await client.messages.create({ body: messageBody, to: recipient, from: '+18327355170' },(err, message) => err ? console.log(err) : console.log(message))

module.exports = SendMessage;
// tK54oogcQ3s0Q-3bTDOOOKXQKsKXgh9lugwrk5uX