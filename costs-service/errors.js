// Defines the error responses used by the Costs Service | Costs Service Errors → 200–299
const errors = {
    INVALID_USER_ID: {
        id: 201,
        message: 'Invalid user ID'
    },
    INTERNAL_SERVER_ERROR: {
        id: 202,
        message: 'Internal server error'
    }
};

module.exports = errors;