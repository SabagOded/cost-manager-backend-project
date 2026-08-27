const mongoose = require('mongoose');

// Defines the structure of every log document stored in MongoDB
const logSchema = new mongoose.Schema({
    timestamp: {type: Date, default: Date.now}, // we pass Mongoose a reference to the function (Date.now),
    // so that it is executed the moment a new log is created - and not when the server starts (Date.now()).

    service: {type: String, required: true}, // Identifies which microservice generated the event

    level: {type: String, // Defines the severity of the event. The values match the Pino methods: logger.info/warn/error()
            required: true,
            enum: ['info', 'warn', 'error']
            },

    message: {type: String, required: true}, // Human-readable description of what happened

    //HTTP-related fields are optional because not every log event necessarily originates from an HTTP request
    method: String,
    path: String,
    status: Number,
});

// Creates the Mongoose Model used to create, query and persist log documents
const Log = mongoose.model('Log', logSchema);

module.exports = Log;