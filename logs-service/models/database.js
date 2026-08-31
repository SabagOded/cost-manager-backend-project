const mongoose = require('mongoose');

// Connects the Logs Service to the cost_manager database in MongoDB Atlas.
function connectToDatabase() {
    // Starts the asynchronous MongoDB connection and returns the resulting Promise.
    return mongoose.connect(
        process.env.MONGODB_URI,
        {
            dbName: 'cost_manager', // Explicitly selects the database inside the MongoDB Atlas cluster
        }
    );
}

module.exports = connectToDatabase;