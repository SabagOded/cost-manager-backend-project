const test = require('node:test');
const assert = require('node:assert');

test('GET /api/total/:userid returns zero for a user with no costs', async function() {
    const testUser = {
        id: Date.now(),
        first_name: 'Total',
        last_name: 'Test',
        birthday: '2000-01-01'
    };

    const createResponse = await fetch("http://localhost:3000/api/add", {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify(testUser)
    });
    assert.strictEqual(createResponse.status, 201);

    const totalResponse = await fetch(`http://localhost:3001/api/total/${testUser.id}`);
    assert.strictEqual(totalResponse.status, 200);

    const totalBody = await totalResponse.json();

    assert.strictEqual(typeof totalBody, 'object');
    assert.notStrictEqual(totalBody, null);

    assert.strictEqual(totalBody.userid, testUser.id);
    assert.strictEqual(totalBody.total, 0);
});

test('POST /api/add creates a new cost', async function() {
    const testUser = {
        id: Date.now(),
        first_name: 'Total',
        last_name: 'Test',
        birthday: '2000-01-01'
    };

    const createResponse = await fetch("http://localhost:3000/api/add", {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify(testUser)
    });
    assert.strictEqual(createResponse.status, 201);

    const testCost ={
        description: "Test cost",
        category: "food",
        userid: testUser.id,
        sum: 10
    };

    const addCostResponse = await fetch("http://localhost:3001/api/add", {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify(testCost)
    });
    assert.strictEqual(addCostResponse.status, 201);

    const costBody = await addCostResponse.json();
    assert.strictEqual(typeof costBody, 'object');
    assert.notStrictEqual(costBody, null);

    assert.strictEqual(typeof costBody.description, 'string');
    assert.strictEqual(costBody.description, testCost.description);

    assert.strictEqual(typeof costBody.category, 'string');
    assert.strictEqual(costBody.category, testCost.category);

    assert.strictEqual(typeof costBody.userid, 'number');
    assert.strictEqual(costBody.userid, testCost.userid);

    assert.strictEqual(typeof costBody.sum, 'number');
    assert.strictEqual(costBody.sum, testCost.sum);

    assert.strictEqual(typeof costBody.date, 'string');
    const returnedDate = new Date(costBody.date);
    assert.ok(!Number.isNaN(returnedDate.getTime()));
});

test('POST /api/add rejects invalid user id input', async function() {
    const invalidCost = {
        description: 'Invalid user ID test',
        category: 'food',
        userid: '123',
        sum: 10
    };

    const response = await fetch('http://localhost:3001/api/add', {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify(invalidCost)
    });

    assert.strictEqual(response.status, 400);

    const errorBody = await response.json();
    assert.strictEqual(errorBody.id, 201);
    assert.strictEqual(errorBody.message, 'Invalid user ID');
});

test('POST /api/add rejects a missing user', async function() {
    const invalidCost = {
        description: 'Missing user test',
        category: 'food',
        userid: Date.now(),
        sum: 10
    };

    const response = await fetch('http://localhost:3001/api/add', {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify(invalidCost)
    });

    assert.strictEqual(response.status, 400);

    const errorBody = await response.json();
    assert.strictEqual(errorBody.id, 201);
    assert.strictEqual(errorBody.message, 'Invalid user ID');
});

test('POST /api/add rejects invalid cost sum input', async function() {
    const invalidCost = {
        description: 'Invalid sum test',
        category: 'food',
        userid: 123,
        sum: '10'
    };

    const response = await fetch('http://localhost:3001/api/add', {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify(invalidCost)
    });

    assert.strictEqual(response.status, 400);

    const errorBody = await response.json();
    assert.strictEqual(errorBody.id, 203);
    assert.strictEqual(errorBody.message, 'Invalid cost input');
});

test('POST /api/add rejects invalid cost category', async function() {
    const testUser = {
        id: Date.now(),
        first_name: 'Invalid Category',
        last_name: 'Test',
        birthday: '2000-01-01'
    };

    const createUserResponse = await fetch('http://localhost:3000/api/add', {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify(testUser)
    });

    assert.strictEqual(createUserResponse.status, 201);

    const invalidCost = {
        description: 'Invalid category test',
        category: 'test',
        userid: testUser.id,
        sum: 10
    };

    const response = await fetch('http://localhost:3001/api/add', {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify(invalidCost)
    });

    assert.strictEqual(response.status, 400);

    const errorBody = await response.json();
    assert.strictEqual(errorBody.id, 203);
    assert.strictEqual(errorBody.message, 'Invalid cost input');
});

test('POST /api/add rejects invalid cost date', async function() {
    const testUser = {
        id: Date.now(),
        first_name: 'Invalid Date',
        last_name: 'Test',
        birthday: '2000-01-01'
    };

    const createUserResponse = await fetch('http://localhost:3000/api/add', {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify(testUser)
    });

    assert.strictEqual(createUserResponse.status, 201);

    const invalidCost = {
        description: 'Invalid date test',
        category: 'food',
        userid: testUser.id,
        sum: 10,
        date: 'not-a-date'
    };

    const response = await fetch('http://localhost:3001/api/add', {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify(invalidCost)
    });

    assert.strictEqual(response.status, 400);

    const errorBody = await response.json();
    assert.strictEqual(errorBody.id, 203);
    assert.strictEqual(errorBody.message, 'Invalid cost input');
});

test('POST /api/add rejects a past cost date', async function() {
    const testUser = {
        id: Date.now(),
        first_name: 'Past Date',
        last_name: 'Test',
        birthday: '2000-01-01'
    };

    const createUserResponse = await fetch('http://localhost:3000/api/add', {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify(testUser)
    });

    assert.strictEqual(createUserResponse.status, 201);

    const invalidCost = {
        description: 'Past date test',
        category: 'food',
        userid: testUser.id,
        sum: 10,
        date: '2020-01-01'
    };

    const response = await fetch('http://localhost:3001/api/add', {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify(invalidCost)
    });

    assert.strictEqual(response.status, 400);

    const errorBody = await response.json();
    assert.strictEqual(errorBody.id, 203);
    assert.strictEqual(errorBody.message, 'Invalid cost input');
});

test('POST /api/add rejects missing cost description', async function() {
    const invalidCost = {
        category: 'food',
        userid: 123,
        sum: 10
    };

    const response = await fetch('http://localhost:3001/api/add', {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify(invalidCost)
    });

    assert.strictEqual(response.status, 400);

    const errorBody = await response.json();
    assert.strictEqual(errorBody.id, 203);
    assert.strictEqual(errorBody.message, 'Invalid cost input');
});

test('GET /api/total/:userid returns the correct total for a user with costs', async function() {
    const testUser = {
        id: Date.now(),
        first_name: 'Total',
        last_name: 'Test',
        birthday: '2000-01-01'
    };

    const createResponse = await fetch("http://localhost:3000/api/add", {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify(testUser)
    });
    assert.strictEqual(createResponse.status, 201);

    const testCost = {
        description: 'Total test cost',
        category: 'food',
        userid: testUser.id,
        sum: 10
    };

    const costResponse = await fetch(`http://localhost:3001/api/add`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify(testCost)
    });
    assert.strictEqual(costResponse.status, 201);

    const totalResponse = await fetch(`http://localhost:3001/api/total/${testUser.id}`);
    assert.strictEqual(totalResponse.status, 200);

    const totalBody = await totalResponse.json();
    assert.strictEqual(totalBody.userid, testUser.id);
    assert.notStrictEqual(totalBody.total, testCost.total);
});

test('GET /api/total/:userid rejects invalid user id', async function() {
    const response = await fetch('http://localhost:3001/api/total/hello');

    assert.strictEqual(response.status, 404);

    const errorBody = await response.json();
    assert.strictEqual(errorBody.id, 201);
    assert.strictEqual(errorBody.message, 'Invalid user ID');
});

test('GET / returns Costs Service health response', async function() {
    const response = await fetch('http://localhost:3001/');

    assert.strictEqual(response.status, 200);

    const body = await response.text();
    assert.strictEqual(body, 'Costs Service is running');
});

test('GET /api/report returns an empty monthly report for a user with no costs', async function() {
    const testUser = {
        id: Date.now(),
        first_name: 'Empty Report',
        last_name: 'Test',
        birthday: '2000-01-01'
    };

    const createUserResponse = await fetch('http://localhost:3000/api/add', {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify(testUser)
    });

    assert.strictEqual(createUserResponse.status, 201);

    const now = new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth() + 1;

    const response = await fetch(
        `http://localhost:3001/api/report?id=${testUser.id}&year=${year}&month=${month}`
    );

    assert.strictEqual(response.status, 200);

    const body = await response.json();

    assert.strictEqual(body.userid, testUser.id);
    assert.strictEqual(body.year, year);
    assert.strictEqual(body.month, month);

    assert.deepStrictEqual(body.costs, [
        { food: [] },
        { education: [] },
        { health: [] },
        { housing: [] },
        { sport: [] }
    ]);
});

test('GET /api/report returns a monthly report with an existing cost', async function() {
    const testUser = {
        id: Date.now(),
        first_name: 'Report Cost',
        last_name: 'Test',
        birthday: '2000-01-01'
    };

    const createUserResponse = await fetch('http://localhost:3000/api/add', {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify(testUser)
    });

    assert.strictEqual(createUserResponse.status, 201);

    const testCost = {
        description: 'Monthly report test cost',
        category: 'food',
        userid: testUser.id,
        sum: 25
    };

    const createCostResponse = await fetch('http://localhost:3001/api/add', {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify(testCost)
    });

    assert.strictEqual(createCostResponse.status, 201);

    const createdCost = await createCostResponse.json();
    const createdDate = new Date(createdCost.date);

    const year = createdDate.getUTCFullYear();
    const month = createdDate.getUTCMonth() + 1;
    const day = createdDate.getUTCDate();

    const response = await fetch(
        `http://localhost:3001/api/report?id=${testUser.id}&year=${year}&month=${month}`
    );

    assert.strictEqual(response.status, 200);

    const body = await response.json();

    assert.strictEqual(body.userid, testUser.id);
    assert.strictEqual(body.year, year);
    assert.strictEqual(body.month, month);

    assert.deepStrictEqual(body.costs, [
        {
            food: [
                {
                    sum: testCost.sum,
                    description: testCost.description,
                    day: day
                }
            ]
        },
        { education: [] },
        { health: [] },
        { housing: [] },
        { sport: [] }
    ]);
});

test('GET /api/report rejects invalid user id', async function() {
    const response = await fetch(
        'http://localhost:3001/api/report?id=hello&year=2026&month=8'
    );

    assert.strictEqual(response.status, 400);

    const errorBody = await response.json();
    assert.strictEqual(errorBody.id, 201);
    assert.strictEqual(errorBody.message, 'Invalid user ID');
});

test('GET /api/report rejects invalid year', async function() {
    const response = await fetch(
        'http://localhost:3001/api/report?id=123&year=0&month=8'
    );

    assert.strictEqual(response.status, 400);

    const errorBody = await response.json();
    assert.strictEqual(errorBody.id, 204);
    assert.strictEqual(errorBody.message, 'Invalid report input');
});

test('GET /api/report rejects invalid month', async function() {
    const response = await fetch(
        'http://localhost:3001/api/report?id=123&year=2026&month=13'
    );

    assert.strictEqual(response.status, 400);

    const errorBody = await response.json();
    assert.strictEqual(errorBody.id, 204);
    assert.strictEqual(errorBody.message, 'Invalid report input');
});

test('GET /api/report returns the same computed historical report on repeated requests', async function() {
    const testUserId = Date.now();

    const firstResponse = await fetch(
        `http://localhost:3001/api/report?id=${testUserId}&year=2026&month=7`
    );

    assert.strictEqual(firstResponse.status, 200);

    const firstBody = await firstResponse.json();

    const secondResponse = await fetch(
        `http://localhost:3001/api/report?id=${testUserId}&year=2026&month=7`
    );

    assert.strictEqual(secondResponse.status, 200);

    const secondBody = await secondResponse.json();

    assert.deepStrictEqual(secondBody, firstBody);
});