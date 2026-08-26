require('dotenv').config();
const express = require('express'); // Loads the express package and returns what it exports
const connectToDatabase = require('./models/database');
const Log = require('./models/log');
const errors = require('./errors');
const writeLog = require('./logger');

const app = express(); // Creating the Express Application
const port = process.env.PORT || 3002; // localhost:3002 → Logs Service

app.use(express.json());

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

    next();
});

function logEndpointAccess(req, res, next) {
    writeLog({
        service: 'logs-service',
        level: 'info',
        message: 'Endpoint accessed',
        method: req.method,
        path: req.originalUrl,
    })
        .catch(function (error) {
            console.error('Failed to save request log:', error.message);
        });

    next();
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
    Log.find()
        .then(function (logs) {
            return res.status(200).json(logs);
        })
        .catch(function (error) {
            return res.status(500).json(errors.INTERNAL_SERVER_ERROR);
        });
});

app.post('/api/logs', logEndpointAccess, function (req, res) {
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