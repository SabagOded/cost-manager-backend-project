require('dotenv').config(); // Loads environment variables from .env into process.env
const express = require('express'); // Loads the Express package
const connectToDatabase = require('./models/database'); // Imports the MongoDB connection function
const Log = require('./models/log'); // Imports the Mongoose Log model
const errors = require('./errors'); // Imports the Logs Service error definitions
const writeLog = require('./logger'); // Imports the function that writes logs using Pino and MongoDB

const app = express(); // Creating the Express Application
const port = process.env.PORT || 3002; // localhost:3002 → Logs Service

app.use(express.json());

/*
 Global logging middleware.
 Runs for every HTTP request received by the Logs Service.
 Logging is intentionally fire-and-forget: we do not await writeLog() so saving the log does not delay the request.
*/
app.use(function (req, res, next) {
    writeLog({
        service: 'logs-service',
        level: 'info',
        message: 'Request received',
        method: req.method,
        path: req.originalUrl,
    })
        .catch(function (error) {
            console.error('Failed to save request log:', error.message);
        });

    next(); // Pass control to the next middleware or route handler in Express
});

/*
 Route-level logging middleware.
 Records when a specific endpoint is accessed before passing control to its handler.
 Endpoint logging is asynchronous and should not delay the actual route handler.
*/
function logEndpointAccess(req, res, next) {
    writeLog({
        service: 'logs-service',
        level: 'info',
        message: 'Endpoint accessed',
        method: req.method,
        path: req.originalUrl,
    })
        .catch(function (error) {
            console.error('Failed to save endpoint log:', error.message);
        });

    next(); // Continue to the actual handler after starting the log operation
}

app.get('/', logEndpointAccess, function (req, res) {
    res.send('Logs Service is running');
});

connectToDatabase()
    .then(function () {
        console.log('Connected to MongoDB Atlas');

        app.listen(port, function () {
            console.log(`Logs Service is running on port ${port}`);
        });

    })
    .catch(function (error) {
        console.error('Failed to connect to MongoDB Atlas', error.message);
    });

app.get('/api/logs', logEndpointAccess, function (req, res) {
    Log.getAllLogs()
        .then(function (logs) {
            return res.status(200).json(logs);
        })
        .catch(function (error) {
            return res.status(500).json(errors.INTERNAL_SERVER_ERROR);
        });
});

// Internal ingestion endpoint used by the other microservices.
// They send log events here over HTTP, and the Logs Service persists them using writeLog().
app.post('/api/logs', logEndpointAccess, function (req, res) {
// Required fields: service, level and message.
// HTTP metadata such as method, path and status is optional.
    const logData = req.body || {};

    if (!logData.service || typeof logData.service !== 'string') {
        return res.status(400).json(errors.INVALID_LOG_INPUT);
    }

    if (!logData.level ||
        typeof logData.level !== 'string' ||
        !['info', 'warn', 'error'].includes(logData.level)
    ) {
        return res.status(400).json(errors.INVALID_LOG_INPUT);
    }

    if (!logData.message || typeof logData.message !== 'string') {
        return res.status(400).json(errors.INVALID_LOG_INPUT);
    }

    if (logData.method !== undefined && typeof logData.method !== 'string') {
        return res.status(400).json(errors.INVALID_LOG_INPUT);
    }

    if (logData.path !== undefined && typeof logData.path !== 'string') {
        return res.status(400).json(errors.INVALID_LOG_INPUT);
    }

    if (logData.status !== undefined && typeof logData.status !== 'number') {
        return res.status(400).json(errors.INVALID_LOG_INPUT);
    }

    // Unlike the logging middleware, this endpoint waits for the log to be saved
    // before returning 201 because persisting the log is the main purpose of this request.
    writeLog(logData)
        .then(function (log) {
            return res.status(201).json(log);
        })
        .catch(function (error) {
            return res.status(500).json(errors.INTERNAL_SERVER_ERROR);
        });
});