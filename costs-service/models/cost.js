const mongoose = require('mongoose');

const costSchema = new mongoose.Schema({ // Creating a Schema object that describes Cost
    description: {type: String, required: true},
    category: {
        type: String,
        required: true,
        enum: ['food' ,'health', 'housing', 'sports', 'education']
    },
    userid: {type: Number, required: true},
    sum: {type: Number, required: true},
    date: {
        type: Date,
        default: Date.now
    }
});

const Cost = mongoose.model('Cost', costSchema); // Creating a Model that connects the Schema to work with documents in MongoDB

module.exports = Cost; // Exports the Cost model for use in other modules