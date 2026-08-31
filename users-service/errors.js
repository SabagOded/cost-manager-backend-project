// Defines the standardized error responses used by the Users Service (IDs 100–199).
const errors = {
    INVALID_USER_INPUT: {
        id: 101,
        message: 'Invalid user input'
    },
    USER_ALREADY_EXISTS: {
        id: 102,
        message: 'User already exists'
    },
    USER_NOT_FOUND: {
        id: 103,
        message: 'User not found'
    },
    INTERNAL_SERVER_ERROR: {
        id: 104,
        message: 'Internal server error'
    }
};

module.exports = errors;