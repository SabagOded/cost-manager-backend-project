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
          validate: {
            validator: function(sum) {
                return sum > 0
            }
          }
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const Cost = mongoose.model('Cost', costSchema); // Creating a Model that connects the Schema to work with documents in MongoDB

function getCostsByUserId(userid) {
    return Cost.find({ userid });
}
Cost.getCostsByUserId = getCostsByUserId;

function createCost(newCost) {
    return Cost.create(newCost);
}
Cost.createCost = createCost;

function getCostsByUserAndDateRange(userid, startDate, endDate) {
    return Cost.find({
        userid: userid,
        date: {
            "$gte": startDate,
            "$lt": endDate
        }
    });
}
Cost.getCostsByUserAndDateRange = getCostsByUserAndDateRange;

module.exports = Cost; // Exports the Cost model for use in other modules