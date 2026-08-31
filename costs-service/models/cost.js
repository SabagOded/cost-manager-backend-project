const mongoose = require('mongoose');

const costSchema = new mongoose.Schema({ // Creating a Schema object that describes Cost
    description: {type: String, required: true},
    category: {
        type: String,
        required: true,
        enum: ['food', 'health', 'housing', 'sport', 'education']
    },
    userid: {type: Number, required: true},
    sum: {type: Number, required: true,
          validate: { // Ensures that every stored cost has a finite positive sum.
            validator: function (sum) {
                return Number.isFinite(sum) && sum > 0;
            }
          }
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const Cost = mongoose.model('Cost', costSchema); // Creating a Model that connects the Schema to work with documents in MongoDB

// Retrieves all costs that belong to a specific user.
function getCostsByUserId(userid) {
    return Cost.find({ userid });
}
Cost.getCostsByUserId = getCostsByUserId;

// Creates and stores a new cost document in MongoDB.
function createCost(newCost) {
    return Cost.create(newCost);
}
Cost.createCost = createCost;

// Retrieves costs for a specific user within the given date range.
// The start date is inclusive and the end date is exclusive.
function getCostsByUserAndDateRange(userid, startDate, endDate) {
    return Cost.find({
        userid: userid,
        date: {
            $gte: startDate,
            $lt: endDate
        }
    });
}
Cost.getCostsByUserAndDateRange = getCostsByUserAndDateRange;

module.exports = Cost; // Exports the Cost model for use in other modules