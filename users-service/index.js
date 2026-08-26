require('dotenv').config(); // Loads environment variables from .env into process.env before the rest of the application is initialized
const express = require('express'); // Loads the express package and returns what it exports
const connectToDatabase = require('./models/database'); // Imports the function responsible for connecting to MongoDB
const User = require('./models/user'); // Imports the Mongoose User model for working with user documents in MongoDB
const errors = require('./errors'); // Imports the Users Service errors definitions
const sendLog = require('./logClient');

const app = express(); // Creating the Express Application
const port = process.env.PORT || 3000; // localhost:3000 → Users Service

app.use(express.json()); // Parses incoming JSON request bodies and makes the data available through req.body

app.use(function (req, res, next) {
   sendLog({
       service: 'users-service',
       level: 'info',
       message: 'Request received',
       method: req.method,
       path: req.originalUrl,
   })
       .catch(function(error) {
           console.error('Failed to send request log: ', error.message);
       });

   next();
});

function logEndpointAccess(req, res, next) {
    sendLog({
        service: 'users-service',
        level: 'info',
        message: 'Endpoint accessed',
        method: req.method,
        path: req.originalUrl
    })
        .catch(function(error) {
            console.error('Failed to send endpoint log: ', error.message);
        });
    next();
}

connectToDatabase()
    .then(function(){ // Connection successful
        console.log('Connected to MongoDB Atlas');

        app.listen(port, function(){ // Starting accepting HTTP requests only after we make sure that the infrastructure the service needs is available
            console.log(`Users Service is running on port ${port}`);
        });
    })
    .catch(function(error) { // Connection failed
        console.error('Failed to connect to MongoDB:', error.message);
    });

app.get('/', logEndpointAccess, function (req, res) {
    res.send('Users service is running');
});

app.get('/api/users', logEndpointAccess, function (req, res) {
    // Returns all users stored in the database
    User.find() // Retrieves all user documents from the users collections
        .then(function(users) {
            return res.status(200).json(users);
        })
        .catch(function(error){
            return res.status(500).json(errors.INTERNAL_SERVER_ERROR);
        });
});

app.get('/api/users/:id', logEndpointAccess, function (req, res) {
    //Returns a specific user together with the total amount of their costs
    const requestedUserId = Number(req.params.id);
    if (Number.isNaN(requestedUserId)) { // Validates that the user ID in the URL is a valid number
        return res.status(400).json(errors.INVALID_USER_INPUT);
    }
        User.findOne({ id: requestedUserId }) // Finds the user by the application-specific ID
            .then(function(user) {
                if (!user) {
                    return res.status(404).json(errors.USER_NOT_FOUND);
                    //HTTP 404 The server returns an error when no user matches the requested ID
                }
                return fetch(`http://localhost:3001/api/total/${requestedUserId}`) // Sends an HTTP GET request from the Users Service to the Costs Service
                    .then(function(response) {
                        // fetch does not reject automatically for HTTP error status codes
                        if (!response.ok) {
                            throw errors.INTERNAL_SERVER_ERROR;
                        }
                        return response.json(); // Parses the response body from JSON into a JavaScript object
                    })
                    .then(function (costData) {
                        // CostData now contains the parsed data returned by the Costs Service
                        return res.status(200).json({
                            first_name: user.first_name,
                            last_name: user.last_name,
                            id: user.id,
                            total: costData.total
                        });
                    });
            }).catch(function(error){
                return res.status(500).json(errors.INTERNAL_SERVER_ERROR);
            });
});

app.get('/api/users/:id/exists', logEndpointAccess, function (req, res) {
    // Check whether a user exists without triggering the Costs Service dependency
    const requestedUserId = Number(req.params.id);
    if (Number.isNaN(requestedUserId)) {
        return res.status(400).json(errors.INVALID_USER_INPUT);
    }
    User.findOne( {id: requestedUserId} ) // Finds the user by the application-specific ID
        .then(function(user) { // Returns only the existence result needed by other services
            if(!user){
                return res.status(200).json({
                        exists: false
                });
            }
            return res.status(200).json({
                exists: true
            });
        })
        .catch(function(error) {
            return res.status(500).json(errors.INTERNAL_SERVER_ERROR);
        });
});

app.post('/api/add', logEndpointAccess, function (req, res) {
    // Handles requests for creating a new user
    const userData = req.body; //Gets the parsed user data sent in the request body

    if ( // Validates that all required user fields were provided
        userData.id === undefined ||
        userData.first_name === undefined ||
        userData.last_name === undefined ||
        userData.birthday === undefined
    ) {
        return res.status(400).json(errors.INVALID_USER_INPUT); // Stops the request early when required user data is missing
        // HTTP 400 Bad Request (A client-side error indicating the server cannot process the request due to invalid syntax)
    }
    if ( // Validates the basic data types of the user fields
        typeof userData.id !== 'number' ||
        typeof userData.first_name !== 'string' ||
        typeof userData.last_name !== 'string'
    ) {
        return res.status(400).json(errors.INVALID_USER_INPUT);
    }

    const birthday = new Date(userData.birthday);
    if (Number.isNaN(birthday.getTime())) { // Validates that the birthday can be converted to a valid Date
        return res.status(400).json(errors.INVALID_USER_INPUT);
    }

    User.findOne({ id: userData.id}) // Checks whether a user with the same application ID already exists
        .then(function(existingUser){
            if (existingUser) {
                throw errors.USER_ALREADY_EXISTS;
            }
            return User.create({
                id: userData.id,
                first_name: userData.first_name,
                last_name: userData.last_name,
                birthday: userData.birthday
            });
        })
        .then(function(createdUser) {
            return res.status(201).json(createdUser);
        })
        .catch(function(error) {
            if (error.id === errors.USER_ALREADY_EXISTS.id){ // Handles the duplicate user error separately from unexpected server errors
                return res.status(409).json(errors.USER_ALREADY_EXISTS);
                //HTTP 409 Conflict (The request could not be processed because of a conflict with the current state)
            }
            return res.status(500).json(errors.INTERNAL_SERVER_ERROR);
            //HTTP 500 Internal Server Error (The server encountered an unexpected condition that prevented it from fulfilling the request)
        });
});
