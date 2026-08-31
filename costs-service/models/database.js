const mongoose = require('mongoose'); // Loads the mongoose package and returns what it exports

// Connects the Costs Service to the cost_manager database in MongoDB Atlas.
function connectToDatabase() {
    // Starts the asynchronous MongoDB connection and returns the resulting Promise.
    return mongoose.connect(
        process.env.MONGODB_URI,
        {
            dbName: 'cost_manager',
        }
    );
}

module.exports = connectToDatabase; // Exports the connection function so it can be called by the service entry point