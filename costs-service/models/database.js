const mongoose = require('mongoose'); // Loads the mongoose package and returns what it exports

function connectToDatabase() {
    return mongoose.connect(
        process.env.MONGODB_URI,
        {
            dbName: 'cost_manager',
        }
    );
}

module.exports = connectToDatabase;