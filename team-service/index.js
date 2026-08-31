const express = require('express'); // Loads the Express package
const sendLog = require('./logClient'); // Imports the client used to send logs to the Logs Service

const app = express(); // Creates the Express application
const port = process.env.PORT || 3003; // localhost:3003 → Team Service

// Global logging middleware - runs for every HTTP request received by the Team Service.
// sendLog() starts an HTTP request to the Logs Service, but we do not wait for it.
// Logging should not delay or block the main business request.
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

    next(); // Continue the Express request flow immediately
});

// Route-level logging middleware - records that a specific endpoint was matched.
// It is passed to each route before the actual endpoint handler.
function logEndpointAccess(req, res, next) {
    sendLog({
        service: 'team-service',
        level: 'info',
        message: 'Endpoint accessed',
        method: req.method,
        path: req.originalUrl
    })
        .catch(function (error) {
            console.error('Failed to send endpoint log: ', error.message);
        });

    next(); // Continue to the actual endpoint handler
}

app.get('/', logEndpointAccess, function (req, res) {
    res.send('Team service is running');
});

/*
 Returns static information about the development team.
 The team members are not stored in MongoDB because they are not application users.
 */
app.get('/api/about', logEndpointAccess, function (req, res) { // Returns static information about the development team.
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

app.listen(port, function() {
    console.log(`Team Service is running on port ${port}`);
});
