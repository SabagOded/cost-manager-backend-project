const mongoose = require('mongoose');

function connectToDatabase() { // Opens the MongoDB connection used by the Logs Service.
    //Mongoose keeps this connection available for later model operations.
    return mongoose.connect(
        process.env.MONGODB_URI,
        {
            dbName: 'cost_manager', // Explicitly selects the database inside the MongoDB Atlas cluster
        }
    );
}

module.exports = connectToDatabase;