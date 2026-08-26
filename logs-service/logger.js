const pino = require('pino');
const Log = require('./models/log'); // Communicating with MongoDB

const logger = pino(); // info/warn/error
                                                                        // ---> Pino -> Terminal
function writeLog(logData) { // An event is occurring -> writeLog(logData) |
                                                                        // ---> Mongoose -> MongoDB -> cost_manager.logs
    logger[logData.level]( // Pino
        {
            service: logData.service,
            method: logData.method,
            path: logData.path,
            status: logData.status
        },
        logData.message
    );
    return Log.create(logData); // creates Mongoose document and saving it inside MongoDB
}

module.exports = writeLog;