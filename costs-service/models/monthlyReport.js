const mongoose = require('mongoose');

// Defines the structure of a single cost item stored inside a computed monthly report.
const reportItemSchema = new mongoose.Schema({
    sum: { type: Number, required: true },
    description: { type: String, required: true },
    day: { type: Number, required: true },
    // Prevents Mongoose from creating a separate _id for each embedded report item,
    // since these items exist only as part of the monthly report and are not accessed independently.
}, { _id: false });

// Defines the persisted structure of a computed monthly report for a specific user and month.
const monthlyReportSchema = new mongoose.Schema({
    userid: {type: Number, required: true},
    month: {type: Number, required: true},
    year: {type: Number, required: true},
    costs: {
        food: [reportItemSchema],
        health: [reportItemSchema],
        housing: [reportItemSchema],
        sport: [reportItemSchema],
        education: [reportItemSchema]
    }
});

monthlyReportSchema.index( // Ensures that only one computed report can exist for each user/year/month combination.
    { userid: 1, year: 1, month: 1 },
    { unique: true }
);

const MonthlyReport = mongoose.model('MonthlyReport', monthlyReportSchema); // Creates the Mongoose model used to access the monthly reports collection.

// Retrieves a previously computed report for a specific user, month and year.
function getMonthlyReportById(requestedUserId, requestedMonth, requestedYear) {
    return MonthlyReport.findOne({
        userid: requestedUserId,
        month: requestedMonth,
        year: requestedYear
    });
}
MonthlyReport.getMonthlyReportById = getMonthlyReportById;

// Stores a newly computed monthly report in MongoDB.
function createMonthlyReport(report) {
    return MonthlyReport.create(report);
}
MonthlyReport.createMonthlyReport = createMonthlyReport;

module.exports = MonthlyReport;

