require('dotenv').config();
const express = require('express'); // Loads the express package and returns what it exports
const connectToDatabase = require('./models/database');
const Log = require('./models/log');
const errors = require('./errors');
const writeLog = require('./logger');

const app = express(); // Creating the Express Application
const port = process.env.PORT || 3002; // localhost:3002 → Logs Service

app.use(express.json());

// Global middleware - runs for every HTTP request that reaches the Logs Service
// Logging is intentionally non-blocking: we start saving the log, but immediately call next() so the actual request doesn't wait for MongoDB
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

// Route-level middleware - runs only when a specific endpoint is matched.
// It creates a separate log event indicating that the endpoint itself was reached.
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
    .then(function(){
        console.log('Connected to MongoDB Atlas');

        app.listen(port, function(){
            console.log(`Logs Service is running on port ${port}`);
        });

    })
    .catch(function(error){
        console.log('Failed to connect to MongoDB Atlas', error.message);
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
    // Required fields: service, level, message,
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

    writeLog(logData)
        .then(function (log) {
            return res.status(201).json(log);
        })
        .catch(function (error) {
            return res.status(500).json(errors.INTERNAL_SERVER_ERROR);
        });
});