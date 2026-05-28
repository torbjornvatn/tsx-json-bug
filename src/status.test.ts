import { test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { fetchJson } from './status.ts';

/**
 * Spin up a temporary local HTTP server that returns `body` as JSON.
 * This keeps the tests fully offline and avoids flaky external calls.
 */
function createTestServer(body: object): Promise<{ url: string; close: () => void }> {
  return new Promise((resolve) => {
    const server = http.createServer((_req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(body));
    });
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address() as { port: number };
      resolve({ url: `http://127.0.0.1:${port}`, close: () => server.close() });
    });
  });
}

test('superagent: fetchJson returns a parsed JSON object', async () => {
  const payload = { status: 'ok', code: 200 };
  const { url, close } = await createTestServer(payload);
  try {
    const result = await fetchJson(url);
    assert.deepEqual(result, payload);
  } finally {
    close();
  }
});

test('superagent: fetchJson handles nested JSON', async () => {
  const payload = { user: { id: 1, name: 'Alice' }, roles: ['admin', 'user'] };
  const { url, close } = await createTestServer(payload);
  try {
    const result = await fetchJson(url);
    assert.deepEqual(result, payload);
  } finally {
    close();
  }
});
