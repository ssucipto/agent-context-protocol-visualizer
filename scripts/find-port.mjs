#!/usr/bin/env node
import { createServer } from 'node:net';
import { execSync } from 'node:child_process';

/**
 * Find a free port starting from `start`, incrementing on conflict.
 * Reports which process is occupying busy ports for debugging.
 */
async function findFreePort(start) {
  return new Promise((resolve) => {
    const server = createServer();
    server.listen(start, () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
    server.on('error', () => {
      // Report what's using this port
      try {
        const result = execSync(`lsof -ti :${start}`, { encoding: 'utf8', timeout: 2000 }).trim();
        if (result) {
          const pids = result.split('\n').slice(0, 3);
          for (const pid of pids) {
            try {
              const cmd = execSync(`ps -p ${pid} -o comm=`, { encoding: 'utf8', timeout: 2000 }).trim();
              console.error(`  ⚠️  Port ${start}: busy (${cmd}, PID ${pid})`);
            } catch {
              console.error(`  ⚠️  Port ${start}: busy (PID ${pid})`);
            }
          }
        }
      } catch {
        console.error(`  ⚠️  Port ${start}: busy (could not identify process)`);
      }
      resolve(findFreePort(start + 1));
    });
  });
}

const port = await findFreePort(3000);
process.stdout.write(String(port));
