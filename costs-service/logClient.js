function sendLog(logData) {
    return fetch('http://localhost:3002/api/logs', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(logData)
    })
        .then(function (response) {
            if (!response.ok) {
                throw new Error('Failed to send log');
            }
            return response;
        });
}

module.exports = sendLog;