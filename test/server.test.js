'use strict';

const { test, before, after } = require('node:test');
const assert = require('node:assert');
const { createApp } = require('../src/server');

let server;
let base;

before(async () => {
  await new Promise((resolve) => {
    server = createApp().listen(0, () => {
      const { port } = server.address();
      base = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

after(() => {
  server.close();
});

test('GET /health returns ok', async () => {
  const res = await fetch(`${base}/health`);
  assert.strictEqual(res.status, 200);
  const body = await res.json();
  assert.deepStrictEqual(body, { status: 'ok' });
});

test('GET /version/:v validates a good semver', async () => {
  const res = await fetch(`${base}/version/1.4.2`);
  assert.strictEqual(res.status, 200);
  const body = await res.json();
  assert.strictEqual(body.version, '1.4.2');
  assert.strictEqual(body.major, 1);
});

test('GET /version/:v rejects a bad semver', async () => {
  const res = await fetch(`${base}/version/not-a-version`);
  assert.strictEqual(res.status, 400);
});

test('POST /sum adds numbers', async () => {
  const res = await fetch(`${base}/sum`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ numbers: [1, 2, 3, 4] }),
  });
  assert.strictEqual(res.status, 200);
  const body = await res.json();
  assert.strictEqual(body.total, 10);
});

test('POST /sum rejects non-numeric input', async () => {
  const res = await fetch(`${base}/sum`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ numbers: [1, 'two', 3] }),
  });
  assert.strictEqual(res.status, 400);
});

test('GET /parse parses a query string', async () => {
  const res = await fetch(`${base}/parse?q=${encodeURIComponent('a=1&b=2')}`);
  assert.strictEqual(res.status, 200);
  const body = await res.json();
  assert.deepStrictEqual(body.parsed, { a: '1', b: '2' });
});
