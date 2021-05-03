const
    express = require('express'),
    bodyParser = require('body-parser');


// Initializing application
    app = express();

app

    // Middleware
    .use(bodyParser.json())
    .use(bodyParser.urlencoded( { extended: true } ))

    // Routes

    // Port
    .listen( process.env.PORT || 1111, err => err ? console.log(err) : console.log(`Server Up and Running in ${process.env.NODE_ENV} mode on Port: ${process.env.PORT || 1111}`)  )