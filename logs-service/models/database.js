const mongoose = require('mongoose');

function connectToDatabase() {
    return mongoose.connect(
        process.env.MONGODB_URI,
        {
            dbName: 'cost_manager',
        }
    );
}

module.exports = connectToDatabase;