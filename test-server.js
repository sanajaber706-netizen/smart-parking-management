const assert = require('assert');
const http = require('http');
const { getAvailablePort } = require('./server');

(async () => {
  const port = 40123;
  const server = http.createServer();

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, resolve);
  });

  const nextPort = await getAvailablePort(port);
  assert.notStrictEqual(nextPort, port, 'Expected a different free port when the requested port is busy');

  await new Promise((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });

  console.log(`Port check passed: ${nextPort}`);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
