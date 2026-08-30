const test = require('node:test');
const assert = require('node:assert');

const usersServiceUrl = process.env.USERS_SERVICE_URL || 'http://localhost:3000';

test('GET /api/users returns all users', async function() {
    const response = await fetch(`${usersServiceUrl}/api/users`);
    assert.strictEqual(response.status, 200);

    const contentType = response.headers.get('content-type');
    assert.ok(contentType.includes('application/json'));

    const body = await response.json();
    assert.ok(Array.isArray(body));


    for (const user of body) {
        assert.strictEqual(typeof user, 'object');
        assert.notStrictEqual(user, null);

        assert.strictEqual(typeof user.id, 'number');
        assert.strictEqual(typeof user.first_name, 'string');
        assert.strictEqual(typeof user.last_name, 'string');
        assert.strictEqual(typeof user.birthday, 'string');
    }
});

test('POST /api/add creates a new user', async function () {
    const testUser = {
        id: Date.now(),
        first_name: 'Test',
        last_name: 'User',
        birthday: '2000-01-01',
    };

    const response = await fetch(`${usersServiceUrl}/api/add`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify(testUser),
    });

    assert.strictEqual(response.status, 201);
    const body = await response.json();
    assert.strictEqual(typeof body, 'object');
    assert.notStrictEqual(body, null);

    assert.strictEqual(typeof body.id, 'number');
    assert.strictEqual(body.id, testUser.id);

    assert.strictEqual(typeof body.first_name, 'string');
    assert.strictEqual(body.first_name, testUser.first_name);

    assert.strictEqual(typeof body.last_name, 'string');
    assert.strictEqual(body.last_name, testUser.last_name);

    assert.strictEqual(typeof body.birthday, 'string');
    assert.strictEqual(
        body.birthday.slice(0, testUser.birthday.length),
        testUser.birthday
    );
});

test('POST /api/add rejects an existing user', async function() {
    const existingUser = {
        id: Date.now(),
        first_name: 'Duplicate',
        last_name: 'Test',
        birthday: '2000-01-01'
    };

    const firstResponse = await fetch(`${usersServiceUrl}/api/add`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify(existingUser),
    });

    assert.strictEqual(firstResponse.status, 201);

    const secondResponse = await fetch(`${usersServiceUrl}/api/add`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify(existingUser),
    });

    assert.strictEqual(secondResponse.status, 409);

    const errorBody = await secondResponse.json();
    assert.strictEqual(errorBody.id, 102);
    assert.strictEqual(errorBody.message, 'User already exists');
});

test('POST /api/add rejects invalid user id input', async function() {
    const invalidUser = {
        id: '123',
        first_name: 'Invalid ID',
        last_name: 'Test',
        birthday: '2000-01-01'
    };

    const response = await fetch(`${usersServiceUrl}/api/add`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify(invalidUser),
    });

    assert.strictEqual(response.status, 400);

    const errorBody = await response.json();
    assert.strictEqual(errorBody.id, 101);
    assert.strictEqual(errorBody.message, 'Invalid user input');
});

test('POST /api/add rejects invalid user birthday input', async function() {
    const invalidUser = {
        id: Date.now(),
        first_name: 'Invalid Birthday',
        last_name: 'Test',
        birthday: 'not-a-date'
    };

    const response = await fetch(`${usersServiceUrl}/api/add`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify(invalidUser),
    });

    assert.strictEqual(response.status, 400);

    const errorBody = await response.json();
    assert.strictEqual(errorBody.id, 101);
    assert.strictEqual(errorBody.message, 'Invalid user input');
});

test('POST /api/add rejects missing user id input', async function() {
    const invalidUser = {
        first_name: 'Missing ID',
        last_name: 'Test',
        birthday: '2000-01-01'
    };

    const response = await fetch(`${usersServiceUrl}/api/add`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify(invalidUser),
    });

    assert.strictEqual(response.status, 400);

    const errorBody = await response.json();
    assert.strictEqual(errorBody.id, 101);
    assert.strictEqual(errorBody.message, 'Invalid user input');
});

test('GET /api/users/:id returns an existing user with total costs', async function() {
    const testUser = {
        id: Date.now(),
        first_name: 'Get User',
        last_name: 'Test',
        birthday: '2000-01-01'
    };

    const createResponse = await fetch(`${usersServiceUrl}/api/add`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify(testUser),
    });
    assert.strictEqual(createResponse.status, 201);

    const userResponse = await fetch(`${usersServiceUrl}/api/users/${testUser.id}`);
    assert.strictEqual(userResponse.status, 200);

    const body = await userResponse.json();
    assert.strictEqual(typeof body, 'object');
    assert.notStrictEqual(body, null);

    assert.strictEqual(typeof body.id, 'number');
    assert.strictEqual(body.id, testUser.id);

    assert.strictEqual(typeof body.first_name, 'string');
    assert.strictEqual(body.first_name, testUser.first_name);

    assert.strictEqual(typeof body.last_name, 'string');
    assert.strictEqual(body.last_name, testUser.last_name);

    assert.strictEqual(typeof body.total, 'number');
    assert.strictEqual(body.total, 0);
});

test('GET /api/users/hello rejects invalid user id', async function() {
    const response = await fetch(`${usersServiceUrl}/api/users/hello`);

    assert.strictEqual(response.status, 400);

    const errorBody = await response.json();
    assert.strictEqual(errorBody.id, 101);
    assert.strictEqual(errorBody.message, 'Invalid user input');
});

test('GET /api/users/:id returns 404 for a missing user', async function() {
    const missingUserId = Date.now();
    const response = await fetch(`${usersServiceUrl}/api/users/${missingUserId}`);
    assert.strictEqual(response.status, 404);
    const errorBody = await response.json();
    assert.strictEqual(errorBody.id, 103);
    assert.strictEqual(errorBody.message, 'User not found');
});

test('GET /api/users/:id/exists returns true for an existing user', async function() {
    const testUser = {
        id: Date.now(),
        first_name: 'True',
        last_name: 'Test',
        birthday: '2000-01-01'
    };

    const createResponse = await fetch(`${usersServiceUrl}/api/add/`,{
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify(testUser),
    });
    assert.strictEqual(createResponse.status, 201);

    const existsResponse = await fetch(`${usersServiceUrl}/api/users/${testUser.id}/exists`);
    assert.strictEqual(existsResponse.status, 200);

    const existsBody = await existsResponse.json();
    assert.strictEqual(existsBody.exists, true);
});

test('GET /api/users/:id/exists returns false for a missing user', async function() {
    const missingUserId = Date.now();

    const existsResponse = await fetch(`${usersServiceUrl}/api/users/${missingUserId}/exists`);
    assert.strictEqual(existsResponse.status, 200);

    const existsBody = await existsResponse.json();
    assert.strictEqual(existsBody.exists, false);
});

test('GET /api/users/:id/exists rejects invalid user id', async function() {
    const response = await fetch(`${usersServiceUrl}/api/users/hello/exists`);

    assert.strictEqual(response.status, 400);

    const errorBody = await response.json();
    assert.strictEqual(errorBody.id, 101);
    assert.strictEqual(errorBody.message, 'Invalid user input');
});

test('GET / returns Users Service health response', async function() {
    const response = await fetch(usersServiceUrl);

    assert.strictEqual(response.status, 200);

    const body = await response.text();
    assert.strictEqual(body, 'Users service is running');
});