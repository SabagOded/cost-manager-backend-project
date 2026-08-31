const mongoose = require('mongoose'); // Loads the Mongoose package and returns what it exports

function connectToDatabase() { // Function that centralizes the Mongoose connection within the models layer
    return mongoose.connect( // Starts an asynchronous I/O request to Atlas and returns a Promise
        process.env.MONGODB_URI,
        {
            dbName: 'cost_manager',
        }
    );
}

module.exports = connectToDatabase; // Passing a reference to the function connectToDatabase

/*
connectToDatabase()
        ↓
mongoose.connect(...)
        ↓
      Promise
*/