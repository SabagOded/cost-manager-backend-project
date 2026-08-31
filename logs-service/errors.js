// Defines the standardized error responses used by the Logs Service (IDs 300–399).
const errors = {
    INTERNAL_SERVER_ERROR: {
        id: 301,
        message: 'Internal server error',
    },

    INVALID_LOG_INPUT: {
        id: 302,
        message: 'Invalid log input',
    }
};

module.exports = errors;