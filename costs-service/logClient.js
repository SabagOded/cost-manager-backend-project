// Sends a log event from this service to the Logs Service over HTTP.
// The services run as separate Node.js processes, so the logData object must be serialized to JSON before it can cross the process boundary.
function sendLog(logData) {
    return fetch('http://localhost:3002/api/logs', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(logData) // Converts the JS object into a JSON string for the HTTP request body
    })
        .then(function (response) {

            // fetch() rejects only on network errors.
            // HTTP errors such as 400/500 must therefore be checked manually.
            if (!response.ok) {
                throw new Error('Failed to send log');
            }
            return response;
        });
}

module.exports = sendLog;