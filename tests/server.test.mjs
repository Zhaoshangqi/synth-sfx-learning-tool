import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { once } from 'node:events';

async function getFreePort() {
  const server = createServer();
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const { port } = server.address();
  server.close();
  await once(server, 'close');
  return port;
}

async function fetchWhenReady(url) {
  let lastError;
  for (let attempt = 0; attempt < 20; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw lastError;
}

test('local server serves JavaScript modules with a browser-compatible MIME type', async () => {
  const port = await getFreePort();
  const server = spawn('python', ['server.py', String(port)], {
    cwd: process.cwd(),
    stdio: 'ignore',
  });

  try {
    const response = await fetchWhenReady(`http://127.0.0.1:${port}/src/app.js`);
    assert.match(response.headers.get('content-type') ?? '', /javascript/);
  } finally {
    server.kill();
  }
});
