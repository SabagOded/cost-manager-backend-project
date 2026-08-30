const test = require('node:test');
const assert = require('node:assert');

const teamServiceUrl = process.env.TEAM_SERVICE_URL || 'http://localhost:3003';

test('GET /api/about returns the development team', async function () {
    const response = await fetch(`${teamServiceUrl}/api/about`);
    assert.strictEqual(response.status, 200);

    const contentType = response.headers.get('content-type');
    assert.ok(contentType.includes('application/json'));

    const body = await response.json();
    assert.ok(Array.isArray(body));

    for (const developer of body) {
        assert.strictEqual(typeof developer, 'object');
        assert.notStrictEqual(developer, null);

        assert.strictEqual(typeof developer.first_name, 'string');
        assert.strictEqual(typeof developer.last_name, 'string');

        const keys = Object.keys(developer);
        assert.strictEqual(keys.length, 2);
        assert.ok(keys.includes('first_name'));
        assert.ok(keys.includes('last_name'));
    }
});

test('GET / returns Team Service health response', async function() {
   const response = await fetch(teamServiceUrl);
   assert.strictEqual(response.status, 200);

   const body = await response.text();
   assert.strictEqual(body, 'Team service is running');
});
