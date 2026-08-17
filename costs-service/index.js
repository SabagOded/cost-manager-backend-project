const express = require('express'); // Loads the express package and returns what it exports
const connectToDatabase = require('./models/database'); // Imports the function responsible for connecting to MongoDB

const app = express(); // Creating the Express Application
const port = process.env.PORT || 3001; // localhost:3001 → Costs Service

connectToDatabase()
    .then(function(){ // Connection successful
        console.log('Connected to MongoDB Atlas');

        app.listen(port, function(){ // Starting accepting HTTP requests only after we make sure that the infrastructure the service needs is available
            console.log(`Costs Service is running on port ${port}`);
        });
    })
    .catch(function(error) { // Connection failed
        console.error('Failed to connect to MongoDB:', error.message);
    });

app.get('/', function (req, res)  {
    res.send('Costs Service is running');
});

