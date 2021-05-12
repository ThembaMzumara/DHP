const
    client = require('twilio')('AC1e4c5867b700988fd758c7388e1762f9', 'dd93a4a77eccce25286fe5bf1fdc8638'),
    SendMessage = async (messageBody, recipient) => {
        await client.messages.create({ body: messageBody, to: recipient, from: '+19097871455' }).then(message => console.log(message)).catch(err => console.log(err))
};

module.exports = SendMessage;
// tK54oogcQ3s0Q-3bTDOOOKXQKsKXgh9lugwrk5uX