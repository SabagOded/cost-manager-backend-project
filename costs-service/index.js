require('dotenv').config(); // Loads environment variables from .env into process.env before the rest of the application is initialized
const express = require('express'); // Loads the express package and returns what it exports
const connectToDatabase = require('./models/database'); // Imports the function responsible for connecting to MongoDB
const Cost = require('./models/cost'); //Imports the Mongoose Cost model for working with cost documents
const errors = require('./errors'); // Imports the Costs Service errors definitions
const MonthlyReport = require('./models/monthlyReport');
const sendLog = require('./logClient');

const app = express(); // Creating the Express Application
const port = process.env.PORT || 3001; // localhost:3001 → Costs Service

app.use(express.json()); // Parses incoming JSON request bodies and makes the data available through req.body

app.use(function (req, res, next) {
    sendLog({
        service: 'costs-service',
        level: 'info',
        message: 'Request received',
        method: req.method,
        path: req.originalUrl,
    })
        .catch(function (error) {
            console.error('Failed to send request log: ', error.message);
        });

    next();
});

function logEndpointAccess(req, res, next) {
    sendLog({
        service: 'costs-service',
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
            console.log(`Costs Service is running on port ${port}`);
        });
    })
    .catch(function(error) { // Connection failed
        console.error('Failed to connect to MongoDB:', error.message);
    });

app.get('/', logEndpointAccess, function (req, res) {
    res.send('Costs Service is running');
});

app.get('/api/total/:userid', logEndpointAccess, function (req, res)  {
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

app.post('/api/add', logEndpointAccess, function (req, res)  {
    //Handles HTTP POST requests for creating a new cost
    const costData = req.body;

    //Validates the basic structure and data types of the incoming cost
    // Each return stops the current route handler immediately if the input is invalid
    if (!costData.description || typeof costData.description !== 'string') {
        return res.status(400).json(errors.INVALID_COST_INPUT);
    }
    if (!costData.category || typeof costData.category !== 'string') {
        return res.status(400).json(errors.INVALID_COST_INPUT);
    }
    if (!Number.isFinite(costData.userid)) {
        return res.status(400).json(errors.INVALID_USER_ID);
    }
    if (!Number.isFinite(costData.sum)) {
        return res.status(400).json(errors.INVALID_COST_INPUT);
    }

    // Verifies that the referenced user exists before saving the cost. Sends a request to the Users Service
    fetch(`http://localhost:3000/api/users/${costData.userid}/exists`)
        .then(function(response) {
            // fetch does not reject automatically for HTTP error status codes
            if (!response.ok) {
                throw errors.INTERNAL_SERVER_ERROR;
            }
            return response.json(); // response = { exists: true||false }
        })
        .then(function(userExistsData) {
            // Throwing here prevents the remaining success handlers from running
            if (!userExistsData.exists) {
                throw errors.INVALID_USER_ID;
            }

            // Creates the object that will eventually be passed to Mongoose
            const newCostData = {
                description: costData.description,
                category: costData.category,
                userid: costData.userid,
                sum: costData.sum
            };

            // If no date is provided, the Mongoose schema applies Date.now by default
            if (typeof costData.date !== 'undefined') {
                const requestedDate = new Date(costData.date);

                if (Number.isNaN(requestedDate.getTime())) { // IMPORTANT: Invalid Date produces NaN when getTime() is called!
                    throw errors.INVALID_COST_INPUT;
                }

                if (requestedDate.getTime() < Date.now()) { // Rejects cost dates that belong to the past, as required by the project rules
                    throw errors.INVALID_COST_INPUT;
                }

                newCostData.date = requestedDate;
            }
            // Cost.create() validates the object according to the Schema, saves it to MongoDB and returns a Promise
            return Cost.create(newCostData);
        })
        .then(function(createdCostData) {
            // This handler runs only if Cost.create() was fulfilled successfully, and createdCostData is the Mongoose document that was created
            return res.status(201).json(createdCostData); // HTTP 201 - indicates that a new resource was successfully created
        })
        .catch(function(error) {
            if (error.id === errors.INVALID_USER_ID.id) {
                return res.status(400).json(errors.INVALID_USER_ID);
            }

            // Handles both application validation errors and Mongoose schema validation errors
            if (
                error.name === 'ValidationError' || // Mongoose produces "ValidationError" when Schema validation fails
                error.id === errors.INVALID_COST_INPUT.id
            ) {
                return res.status(400).json(errors.INVALID_COST_INPUT);
            }
            return res.status(500).json(errors.INTERNAL_SERVER_ERROR); // For any  unexpected database, network or application error
        });
});

app.get('/api/report', logEndpointAccess, function (req, res)  { // Extracts and convert the user id from the query string
    const requestedUserId = Number(req.query.id);

    if (Number.isNaN(requestedUserId)) {
        return res.status(400).json(errors.INVALID_USER_ID);
    }

    const requestedYear = Number(req.query.year);

    // The report must receive a valid positive integer year
    if (Number.isNaN(requestedYear) ||
        requestedYear <= 0 ||
        (!Number.isInteger(requestedYear))) {
            return res.status(400).json(errors.INVALID_REPORT_INPUT);
    }

    const requestedMonth = Number(req.query.month);

    // Month must be an integer between 1 and 12
    if (Number.isNaN(requestedMonth) ||
        (requestedMonth <= 0 || requestedMonth >= 13) ||
        (!Number.isInteger(requestedMonth))) {
        return res.status(400).json(errors.INVALID_REPORT_INPUT);
    }

    //Create the exact UTC boundaries of the requested month.
    const startDate = new Date( // startDate is inclusive
        Date.UTC(requestedYear, requestedMonth - 1, 1, 0, 0, 0, 0));

    const endDate = new Date( // endDate represents the first day of the following month and is therefore exclusive.
        Date.UTC(requestedYear, requestedMonth, 1, 0, 0, 0));

    function calculateReport() {
        // Calculate a monthly report directly from the costs collection
        // The function returns a Promise that resolves to the report object and doesn't send an HTTP response by itself

        const reportCosts = { food: [], health: [], housing: [], sports: [], education:[] }; // Initialize every required category so that empty
                                                                                            // categories are still included in the final report

        return Cost.find( { // Fetch only costs that belong to the requested user and month
            userid: requestedUserId,
            date: {
                "$gte": startDate,
                "$lt": endDate
            }
        })
            .then(function(costs) {
                for (const cost of costs) { // Group each cost under its category and keep only the fields required by the monthly report API
                    reportCosts[cost.category].push({
                        sum: cost.sum,
                        description: cost.description,
                        day: cost.date.getUTCDate()
                    });
                }
                return {
                    userid: requestedUserId,
                    year: requestedYear,
                    month: requestedMonth,
                    costs: reportCosts
                };
            });
    }

    /*
    The Computed Pattern is used for historical monthly reports.
    Once a month has ended, its costs cannot change because pasts costs cannot be added.
    Therefore, the report is calculated once and stored.
    Future requests for the same historical month return the saved report insted of quering and calculating the costs again.
     */

    const isHistoricalMonth = endDate.getTime() <= Date.now();

    if (isHistoricalMonth) { // Historical reports may already have a previously computed result
        return MonthlyReport.findOne({ // Check whether this exact user/month/year report was alreay computed
            userid: requestedUserId,
            month: requestedMonth,
            year: requestedYear
        })
            .then(function (savedReport) {
                if (savedReport) { // Reuse the stored report instead of calculating the month again
                    return res.status(200).json({
                        userid: savedReport.userid,
                        month: savedReport.month,
                        year: savedReport.year,
                        costs: savedReport.costs
                    });
                }
                return calculateReport() // No stored report exist yet, so calculate it once and persist it
                    .then(function(report) {
                        return MonthlyReport.create(report);
                    })
                    .then(function(savedReport) {
                        return res.status(200).json({
                            userid: savedReport.userid,
                            month: savedReport.month,
                            year: savedReport.year,
                            costs: savedReport.costs
                        });
                    });
            })
            .catch(function(error) {
                return res.status(500).json(errors.INTERNAL_SERVER_ERROR);
            })
    }

    return calculateReport() // Current and future months are calculated dynamically and are not stored, because their data may still change
        .then(function(report) {
            return res.status(200).json({
                userid: report.userid,
                month: report.month,
                year: report.year,
                costs: report.costs
            });
        })
        .catch(function(error) {
            return res.status(500).json(errors.INTERNAL_SERVER_ERROR);
        });
});