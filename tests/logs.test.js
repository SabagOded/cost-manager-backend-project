const test = require('node:test');
const assert = require('node:assert');

test('GET / returns Logs Service health response', async function() {
    const response = await fetch('http://localhost:3002/');

    assert.strictEqual(response.status, 200);

    const body = await response.text();
    assert.strictEqual(body, 'Logs Service is running');
});

test('GET /api/logs returns an array of logs', async function() {
    const response = await fetch('http://localhost:3002/api/logs');

    assert.strictEqual(response.status, 200);

    const body = await response.json();
    assert.ok(Array.isArray(body));
});

test('POST /api/logs creates a new log', async function() {
    const testLog = {
        service: 'tests',
        level: 'warn',
        message: `Automated log test ${Date.now()}`,
        method: 'POST',
        path: '/tests',
        status: 200
    };

    const response = await fetch('http://localhost:3002/api/logs', {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify(testLog)
    });

    assert.strictEqual(response.status, 201);

    const body = await response.json();

    assert.strictEqual(typeof body, 'object');
    assert.notStrictEqual(body, null);

    assert.strictEqual(body.service, testLog.service);
    assert.strictEqual(body.level, testLog.level);
    assert.strictEqual(body.message, testLog.message);
    assert.strictEqual(body.method, testLog.method);
    assert.strictEqual(body.path, testLog.path);
    assert.strictEqual(body.status, testLog.status);

    assert.strictEqual(typeof body.timestamp, 'string');

    const timestamp = new Date(body.timestamp);
    assert.ok(!Number.isNaN(timestamp.getTime()));
});

test('GET /api/logs contains a newly created log', async function() {
    const uniqueMessage = `Persistence test ${Date.now()}`;

    const testLog = {
        service: 'tests',
        level: 'info',
        message: uniqueMessage
    };

    const createResponse = await fetch('http://localhost:3002/api/logs', {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify(testLog)
    });

    assert.strictEqual(createResponse.status, 201);

    const logsResponse = await fetch('http://localhost:3002/api/logs');

    assert.strictEqual(logsResponse.status, 200);

    const logs = await logsResponse.json();

    assert.ok(Array.isArray(logs));

    const logExists = logs.some(function(log) {
        return log.message === uniqueMessage;
    });

    assert.strictEqual(logExists, true);
});

test('POST /api/logs rejects invalid log level', async function() {
    const invalidLog = {
        service: 'tests',
        level: 'invalid-level',
        message: 'Invalid level test'
    };

    const response = await fetch('http://localhost:3002/api/logs', {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify(invalidLog)
    });

    assert.strictEqual(response.status, 400);

    const errorBody = await response.json();
    assert.strictEqual(errorBody.id, 302);
    assert.strictEqual(errorBody.message, 'Invalid log input');
});

test('POST /api/logs rejects missing service', async function() {
    const invalidLog = {
        level: 'info',
        message: 'Missing service test'
    };

    const response = await fetch('http://localhost:3002/api/logs', {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify(invalidLog)
    });

    assert.strictEqual(response.status, 400);

    const errorBody = await response.json();
    assert.strictEqual(errorBody.id, 302);
    assert.strictEqual(errorBody.message, 'Invalid log input');
});

test('POST /api/logs rejects missing message', async function() {
    const invalidLog = {
        service: 'tests',
        level: 'info'
    };

    const response = await fetch('http://localhost:3002/api/logs', {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify(invalidLog)
    });

    assert.strictEqual(response.status, 400);

    const errorBody = await response.json();
    assert.strictEqual(errorBody.id, 302);
    assert.strictEqual(errorBody.message, 'Invalid log input');
});

test('POST /api/logs rejects invalid optional method type', async function() {
    const invalidLog = {
        service: 'tests',
        level: 'info',
        message: 'Invalid method test',
        method: 123
    };

    const response = await fetch('http://localhost:3002/api/logs', {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify(invalidLog)
    });

    assert.strictEqual(response.status, 400);

    const errorBody = await response.json();
    assert.strictEqual(errorBody.id, 302);
    assert.strictEqual(errorBody.message, 'Invalid log input');
});

test('POST /api/logs rejects invalid optional status type', async function() {
    const invalidLog = {
        service: 'tests',
        level: 'info',
        message: 'Invalid status test',
        status: '200'
    };

    const response = await fetch('http://localhost:3002/api/logs', {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify(invalidLog)
    });

    assert.strictEqual(response.status, 400);

    const errorBody = await response.json();
    assert.strictEqual(errorBody.id, 302);
    assert.strictEqual(errorBody.message, 'Invalid log input');
});