const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    timestamp: {type: Date, default: Date.now}, // we pass Mongoose a reference to the function (Date.now),
    // so that it is executed the moment a new log is created - and not when the server starts (Date.now()).
    service: {type: String, required: true},
    level: {type: String,
            required: true,
            enum: ['info', 'warning', 'error']
            },
    message: {type: String, required: true},
    method: String,
    path: String,
    status: Number,
});

const Log = mongoose.model('Log', logSchema);

module.exports = Log;