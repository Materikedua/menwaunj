import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createServer } from 'vite';
import { ACTION_BASELINES } from '../server/command/actions.mjs';

test('Vite HTTP denies default and extensionless custom database paths while exposing only published action metadata', async t => {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const directory = await mkdtemp(path.join(root, '.command-http-test-'));
  const databasePath = path.join(directory, 'private.data');
  const previous = process.env.COMMAND_DATABASE_PATH;
  process.env.COMMAND_DATABASE_PATH = databasePath;
  let server;
  try {
    server = await createServer({
      configFile: path.join(root, 'vite.config.js'), root,
      cacheDir: path.join(directory, 'vite-cache'),
      logLevel: 'silent', clearScreen: false,
      optimizeDeps: { noDiscovery: true, include: [] },
      server: { host: '127.0.0.1', port: 0, strictPort: false },
    });
  } catch (error) {
    await rm(directory, { recursive: true, force: true }); throw error;
  } finally {
    if (previous === undefined) delete process.env.COMMAND_DATABASE_PATH;
    else process.env.COMMAND_DATABASE_PATH = previous;
  }
  t.after(async () => { await server.close(); await rm(directory, { recursive: true, force: true }); });
  await server.listen();
  const origin = `http://127.0.0.1:${server.httpServer.address().port}`;
  const relative = `/${path.relative(root, databasePath).replaceAll('\\', '/')}`;
  const absolute = `/@fs/${databasePath.replaceAll('\\', '/')}`;
  for (const privateUrl of [
    '/.command-os/command.sqlite', '/.command-os/command.sqlite-journal',
    '/server/command/service.mjs', '/server/command/security.mjs?raw',
    relative, `${relative}-journal`, `${relative}-wal`, `${relative}-shm`,
    absolute, `${absolute}?raw`, `${absolute}-journal`, `${absolute}-wal`,
  ]) {
    const result = await fetch(`${origin}${privateUrl}`);
    assert.equal(result.status, 403, privateUrl);
    assert.equal(await result.text(), 'Forbidden');
  }
  const publicResponse = await fetch(`${origin}/api/public/actions`);
  assert.equal(publicResponse.status, 200);
  const data = await publicResponse.json();
  assert.deepEqual(data.actions.map(({ id, label, url }) => ({ id, label, url })), ACTION_BASELINES);
  assert.doesNotMatch(JSON.stringify(data), /password|csrf|session|createdBy|approvedBy|private\.data/i);
  const session = await fetch(`${origin}/api/command/session`);
  assert.equal(session.status, 200);
  assert.deepEqual(await session.json(), { user: null, csrfToken: null });
  const denied = await fetch(`${origin}/api/command/tasks`);
  assert.equal(denied.status, 401);
  const page = await fetch(`${origin}/command-center`);
  assert.equal(page.status, 200);
  assert.match(await page.text(), /id="root"/);
});
