const mongoose = require('mongoose');

const reportItemSchema = new mongoose.Schema({
    sum: {type: Number, required: true},
    description: {type: String, required: true},
    day: {type: Number, required: true},
}, {_id: false});

const monthlyReportSchema = new mongoose.Schema({
    userid: {type: Number, required: true},
    month: {type: Number, required: true},
    year: {type: Number, required: true},
    costs: {
        food: [reportItemSchema],
        health: [reportItemSchema],
        housing: [reportItemSchema],
        sports: [reportItemSchema],
        education: [reportItemSchema]
    }
});

monthlyReportSchema.index(
    { userid: 1, year: 1, month: 1 },
    { unique: true }
);

const MonthlyReport = mongoose.model('MonthlyReport', monthlyReportSchema);

module.exports = MonthlyReport;

