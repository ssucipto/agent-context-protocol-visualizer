#!/usr/bin/env node
import { createServer } from 'node:net';

function findFreePort(start) {
  return new Promise((resolve) => {
    const server = createServer();
    server.listen(start, () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
    server.on('error', () => resolve(findFreePort(start + 1)));
  });
}

const port = await findFreePort(3000);
process.stdout.write(String(port));
