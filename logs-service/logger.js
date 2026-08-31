const pino = require('pino');
const Log = require('./models/log'); // Mongoose model used to persist log documents in MongoDB

const logger = pino(); // Creates the Pino Logger used for structured terminal output. info/warn/error

/*
Receives a plain JavaScript object that describes an event.
The same event is sent through two logging paths:
1. Pino -> structured log output in the terminal
2. Mongoose -> persistent Log document in MongoDB
 */

                                                                        // ---> Pino -> Terminal
function writeLog(logData) { // An event is occurring -> writeLog(logData) |
                                                                        // ---> Mongoose -> MongoDB -> cost_manager.logs
    //Dynamically chooses the Pino method according to logData.level:
    logger[logData.level]( // "info" -> logger.info()   |    "warn" -> logger.warn()    |    "error" -> logger.error()
        {
            service: logData.service,
            method: logData.method,
            path: logData.path,
            status: logData.status
        },
        logData.message
    );
    // Saves the log to MongoDB through the model layer and returns a Promise
    return Log.createLog(logData);
}

module.exports = writeLog;