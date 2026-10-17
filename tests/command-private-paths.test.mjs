import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { isPrivateRequestUrl } from '../server/command/private-paths.mjs';

test('Vite cannot serve configured database and sidecars, regardless of file extension', () => {
  const root = path.resolve('.');
  const database = path.join(root, 'data', 'command.private');
  for (const suffix of ['', '-wal', '-shm', '-journal']) {
    assert.equal(isPrivateRequestUrl(`/data/command.private${suffix}?raw`, root, database), true);
    assert.equal(isPrivateRequestUrl(`/@fs/${database.replaceAll('\\', '/')}${suffix}`, root, database), true);
  }
  for (const url of ['/.command-os/command.sqlite', '/%2ecommand-os/command.sqlite', '/server/command/service.mjs', '/other/command.db', '/bad%ZZ']) {
    assert.equal(isPrivateRequestUrl(url, root, database), true);
  }
  assert.equal(isPrivateRequestUrl('/api/public/actions', root, database), false);
  assert.equal(isPrivateRequestUrl('/src/command/CommandCenter.jsx', root, database), false);
});
