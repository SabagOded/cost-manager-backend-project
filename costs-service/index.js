const express = require('express'); // Loads the express package and returns what it exports
const connectToDatabase = require('./models/database'); // Imports the function responsible for connecting to MongoDB
const Cost = require('./models/cost'); //Imports the Mongoose Cost model for working with cost documents
const errors = require('./errors'); // Imports the Costs Service errors definitions


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

app.get('/api/total/:userid', function (req, res)  {
    //Returns the total amount of costs for a specific user
    const requestedUserid = Number(req.params.userid);

    if (Number.isNaN(requestedUserid)) {
        return res.status(404).json(errors.INVALID_USER_ID);
    }

    Cost.find({ userid: requestedUserid })
        .then(function(costs){
            const total = costs.reduce(function(sum, cost) {
                return sum + cost.sum;
            }, 0);

            return res.status(200).json({
                userid: requestedUserid,
                total: total
            });
        })
        .catch(function(error) {
            return res.status(500).json(errors.INTERNAL_SERVER_ERROR);
        });
});
