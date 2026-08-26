const express = require('express'); //Loads the express package and returns what it exports
const sendLog = require('./logClient');

const app = express(); //Creating the Express Application
const port = process.env.PORT || 3003; //localhost:3003 → Team Service

app.use(function (req, res, next) {
    sendLog({
        service: 'team-service',
        level: 'info',
        message: 'Request received',
        method: req.method,
        path: req.originalUrl,
    })
        .catch(function (error) {
            console.error('Failed to send request log: ', error.message);
        });

    next();
});

function logEndpointAccess(req, res, next) {
    sendLog({
        service: 'team-service',
        level: 'info',
        message: 'Endpoint accessed',
        method: req.method,
        path: req.originalUrl
    })
        .catch(function(error) {
            console.error('Failed to send endpoint log: ', error.message);
        });

    next();
}

app.get('/', logEndpointAccess, function (req, res) {
    res.send('Team Service is running');
});

app.get('/api/about', logEndpointAccess, function (req, res) {
    return res.status(200).json([
        {
            first_name: 'Oded',
            last_name: 'Sabag',
        },
        {
            first_name: 'Ohad',
            last_name: 'Naor',
        }
    ]);
});

app.listen(port, function(){
    console.log(`Team Service is running on port ${port}`);
});
