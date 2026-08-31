// Defines the standardized error responses used by the Costs Service (IDs 200–299).
const errors = {
    INVALID_USER_ID: {
        id: 201,
        message: 'Invalid user ID'
    },
    INTERNAL_SERVER_ERROR: {
        id: 202,
        message: 'Internal server error'
    },
    INVALID_COST_INPUT: {
        id: 203,
        message: 'Invalid cost input'
    },
    INVALID_REPORT_INPUT: {
        id: 204,
        message: 'Invalid report input'
    }
};

module.exports = errors;