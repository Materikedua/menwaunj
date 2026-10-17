import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { once } from 'node:events';
import { DatabaseSync } from 'node:sqlite';
import { createCommandService } from '../server/command/service.mjs';
import { ACTION_BASELINES, parseCommand, validateDestination } from '../server/command/actions.mjs';
import { normalizeUsername, validatePassword } from '../server/command/security.mjs';
import { parseArguments } from '../scripts/command-admin.mjs';

const PASSWORD = 'Individual-Test-Password!42';

async function fixture(t, options = {}) {
  const directory = await mkdtemp(path.join(tmpdir(), 'menwa-command-test-'));
  const databasePath = path.join(directory, 'command.sqlite');
  const state = { service: createCommandService({ databasePath, ...options }) };
  const server = createServer((req, res) => {
    state.service.handler(req, res, () => { res.statusCode = 404; res.end(); });
  });
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  const origin = `http://127.0.0.1:${server.address().port}`;
  t.after(async () => {
    const done = new Promise(resolve => server.close(resolve));
    server.closeAllConnections(); await done;
    state.service.close(); await rm(directory, { recursive: true, force: true });
  });
  async function request(route, { method = 'GET', body, auth, headers = {}, origin: requestOrigin = origin } = {}) {
    const response = await fetch(`${origin}${route}`, {
      method,
      headers: { ...(method === 'POST' ? { 'Content-Type': 'application/json', Origin: requestOrigin } : {}),
        ...(auth ? { Cookie: auth.cookie, 'X-CSRF-Token': auth.csrfToken } : {}), ...headers },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
    const data = await response.json();
    return { status: response.status, data, headers: response.headers };
  }
  async function addUser(username, role = 'editor') {
    return state.service.createUser({ username, name: `Person ${username}`, password: PASSWORD, role });
  }
  async function login(username, password = PASSWORD) {
    const result = await request('/api/command/login', { method: 'POST', body: { username, password } });
    assert.equal(result.status, 200);
    return { cookie: result.headers.get('set-cookie').split(';')[0], csrfToken: result.data.csrfToken, user: result.data.user, headers: result.headers };
  }
  async function task(auth, command = 'Ubah link pendaftaran KC menjadi https://forms.gle/NewRegistration123') {
    const result = await request('/api/command/tasks', { method: 'POST', auth, body: { command } });
    assert.equal(result.status, 201, result.data.error);
    return result.data.task;
  }
  async function mutate(auth, id, operation) { return request(`/api/command/tasks/${id}/${operation}`, { method: 'POST', auth, body: {} }); }
  return { ...state, state, request, addUser, login, task, mutate, databasePath, origin };
}

test('parser resolves only clear actions, preserves URL bytes, and rejects unsafe destinations', () => {
  const url = 'https://forms.gle/AbCdef123?usp=Sharing&entry.123=Hello%20World#SectionOne';
  assert.equal(parseCommand(`Ubah link pendaftaran KC menjadi ${url}`).afterUrl, url);
  const examples = [
    ['Ganti pendaftaran Youth Spark', 'youth-spark-registration'],
    ['Update jersey peserta KC', 'kc-jersey-peserta'],
    ['Change jersey official KC', 'kc-jersey-official'],
    ['Set kc-registration', 'kc-registration'],
    ['Set youth-spark-registration', 'youth-spark-registration'],
    ['Set kc-jersey-peserta', 'kc-jersey-peserta'],
    ['Set kc-jersey-official', 'kc-jersey-official'],
  ];
  for (const [prefix, actionId] of examples) assert.equal(parseCommand(`${prefix} ${url}`).actionId, actionId);
  for (const command of [
    `Ubah link jersey KC ${url}`, `Apa link pendaftaran KC ${url}`,
    `Ubah pendaftaran KC dan pendaftaran Youth Spark ${url}`,
    `Ubah pendaftaran KC ${url} https://forms.gle/Second`,
  ]) assert.throws(() => parseCommand(command), { status: 422 });
  for (const unsafe of ['http://forms.gle/Test', 'javascript:alert(1)', 'https://127.0.0.1/form', 'https://192.168.1.2/form', 'https://localhost/form', 'https://forms.gle.evil.example/Test', 'https://person:secret@forms.gle/Test', 'https://forms.gle:8443/Test', 'https://example.com/form', 'https://docs.google.com/document/d/Test/edit', 'https://forms.gle\\@evil.example/Test']) {
    assert.throws(() => validateDestination(unsafe), { status: 422 });
  }
  assert.doesNotThrow(() => validateDestination('https://docs.google.com/forms/d/e/ExampleID/viewform?usp=sharing'));
  const bitly = ACTION_BASELINES.find(action => action.id === 'kc-registration').url;
  assert.throws(() => validateDestination(bitly), { status: 422 });
  assert.doesNotThrow(() => validateDestination(bitly, { restoreBaseline: true }));
  assert.equal(parseCommand(`Set kc-registration ${url}`).validation.find(item => item.name === 'reachability').passed, null);
});

test('account provisioning validates individual identities, roles, and passwords; CLI refuses password flags', async t => {
  const app = await fixture(t);
  assert.equal(normalizeUsername('  Person.One '), 'person.one');
  assert.throws(() => normalizeUsername('a'), { status: 422 });
  assert.throws(() => validatePassword('short'), { status: 422 });
  assert.throws(() => validatePassword(' '.repeat(20)), { status: 422 });
  await assert.rejects(app.service.createUser({ username: 'person.one', name: 'Person One', password: PASSWORD, role: 'superuser' }), { status: 422 });
  await app.addUser('person.one');
  await assert.rejects(app.addUser('PERSON.ONE'), { status: 409 });
  assert.throws(() => parseArguments(['create-user', '--username', 'person.one', '--name', 'One', '--role', 'admin', '--password', PASSWORD]));
  const db = new DatabaseSync(app.databasePath);
  const user = db.prepare('SELECT password_salt,password_hash FROM users').get();
  assert.equal(user.password_hash.length, 128); assert.notEqual(user.password_hash, PASSWORD);
  assert.equal(user.password_salt.length, 32); db.close();
});

test('anonymous public projection is baseline-only while internal records require authentication', async t => {
  const app = await fixture(t);
  assert.deepEqual((await app.request('/api/command/session')).data, { user: null, csrfToken: null });
  for (const route of ['/api/command/actions', '/api/command/tasks', '/api/command/audit']) assert.equal((await app.request(route)).status, 401);
  assert.equal((await app.request('/api/command/tasks', { method: 'POST', body: { command: 'anything' } })).status, 401);
  const published = await app.request('/api/public/actions');
  assert.equal(published.status, 200);
  assert.deepEqual(published.data.actions.map(({ id, label, url }) => ({ id, label, url })), ACTION_BASELINES);
  assert.ok(published.data.actions.every(action => action.revision === 1));
  assert.doesNotMatch(JSON.stringify(published.data), /password|csrf|session|createdBy|approvedBy/i);
  assert.equal((await app.request('/api/public/actions', { method: 'POST', body: {} })).status, 405);
});

test('login rotates hashed sessions, CSRF and exact Origin protect mutations, logout revokes cookie', async t => {
  const app = await fixture(t); await app.addUser('editor.one');
  const evilOrigin = 'http://outside.example';
  assert.equal((await app.request('/api/command/login', { method: 'POST', origin: evilOrigin, body: { username: 'editor.one', password: PASSWORD } })).status, 403);
  assert.equal((await app.request('/api/command/login', { method: 'POST', headers: { Origin: `${app.origin}/path` }, body: { username: 'editor.one', password: PASSWORD } })).status, 403);
  const auth = await app.login('editor.one');
  const cookie = auth.headers.get('set-cookie');
  assert.match(cookie, /HttpOnly/); assert.match(cookie, /SameSite=Strict/); assert.match(cookie, /Path=\//); assert.match(cookie, /Max-Age=28800/);
  assert.deepEqual((await app.request('/api/command/session', { auth })).data.user, auth.user);
  const forbiddenCsrf = await app.request('/api/command/tasks', { method: 'POST', auth, body: { command: 'anything' }, headers: { 'X-CSRF-Token': 'wrong-token' } });
  assert.equal(forbiddenCsrf.status, 403); assert.equal(forbiddenCsrf.data.code, 'CSRF_REQUIRED');
  assert.equal((await app.request('/api/command/logout', { method: 'POST', auth, body: {}, origin: evilOrigin })).status, 403);
  const db = new DatabaseSync(app.databasePath);
  assert.notEqual(db.prepare('SELECT token_hash FROM sessions').get().token_hash, auth.cookie.split('=')[1]); db.close();
  const relogin = await app.request('/api/command/login', { method: 'POST', auth, body: { username: 'editor.one', password: PASSWORD } });
  assert.equal(relogin.status, 200);
  assert.equal((await app.request('/api/command/session', { auth })).data.user, null);
  const newAuth = { cookie: relogin.headers.get('set-cookie').split(';')[0], csrfToken: relogin.data.csrfToken };
  assert.equal((await app.request('/api/command/logout', { method: 'POST', auth: newAuth, body: {} })).status, 200);
  assert.equal((await app.request('/api/command/session', { auth: newAuth })).data.user, null);
});

test('rate limits are persisted and do not trust forwarded addresses; session expiry is enforced', async t => {
  let time = Date.now();
  const app = await fixture(t, { now: () => time, sessionTtlMs: 1000, loginMaxAttempts: 2 });
  await app.addUser('editor.one');
  const auth = await app.login('editor.one');
  time += 1001;
  assert.equal((await app.request('/api/command/session', { auth })).data.user, null);
  assert.equal((await app.request('/api/command/login', { method: 'POST', body: { username: 'missing.user', password: 'wrong' } })).status, 401);
  const denied = await app.request('/api/command/login', { method: 'POST', headers: { 'X-Forwarded-For': 'different-attacker' }, body: { username: 'editor.one', password: PASSWORD } });
  assert.equal(denied.status, 429);
  app.state.service.close(); app.state.service = createCommandService({ databasePath: app.databasePath, now: () => time, loginMaxAttempts: 2 });
  assert.equal((await app.request('/api/command/login', { method: 'POST', body: { username: 'editor.one', password: PASSWORD } })).status, 429);
  time += 15 * 60 * 1000;
  assert.equal((await app.request('/api/command/login', { method: 'POST', body: { username: 'editor.one', password: PASSWORD } })).status, 200);
});

test('role gates and independent approval prevent edits from becoming public before approval and publish', async t => {
  const app = await fixture(t);
  await app.addUser('editor.one'); await app.addUser('approver.one', 'approver'); await app.addUser('admin.one', 'admin');
  const editor = await app.login('editor.one'); const approver = await app.login('approver.one'); const admin = await app.login('admin.one');
  const originalUrl = ACTION_BASELINES[0].url;
  const task = await app.task(editor);
  assert.equal(task.status, 'AWAITING_APPROVAL'); assert.equal(task.actionLabel, ACTION_BASELINES[0].label); assert.equal(task.createdBy.id, editor.user.id);
  assert.equal((await app.request('/api/public/actions')).data.actions[0].url, originalUrl);
  assert.equal((await app.mutate(editor, task.id, 'approve')).status, 403);
  assert.equal((await app.mutate(editor, task.id, 'publish')).status, 403);
  assert.equal((await app.mutate(editor, task.id, 'rollback')).status, 403);
  assert.equal((await app.mutate(approver, task.id, 'publish')).data.code, 'APPROVAL_REQUIRED');
  assert.equal((await app.request('/api/command/tasks', { method: 'POST', auth: approver, body: { command: 'Set kc-registration https://forms.gle/Other' } })).status, 403);
  const own = await app.task(admin, 'Set youth-spark-registration https://forms.gle/YouthNew');
  assert.equal((await app.mutate(admin, own.id, 'approve')).data.code, 'SELF_APPROVAL');
  const approved = await app.mutate(approver, task.id, 'approve');
  assert.equal(approved.data.task.status, 'APPROVED'); assert.equal(approved.data.task.approvedBy.id, approver.user.id);
  assert.equal((await app.request('/api/public/actions')).data.actions[0].url, originalUrl);
  const published = await app.mutate(admin, task.id, 'publish');
  assert.equal(published.data.task.status, 'COMPLETED'); assert.ok(published.data.task.publishedAt);
  const action = (await app.request('/api/public/actions')).data.actions[0];
  assert.equal(action.url, task.afterUrl); assert.equal(action.revision, 2);
  assert.equal((await app.mutate(admin, task.id, 'publish')).data.task.id, task.id);
  assert.equal((await app.request('/api/public/actions')).data.actions[0].revision, 2);
  const audit = (await app.request('/api/command/audit', { auth: editor })).data.entries;
  assert.equal(audit.filter(entry => entry.type === 'TASK_PUBLISHED' && entry.taskId === task.id).length, 1);
  assert.doesNotMatch(JSON.stringify(audit), /password_hash|password_salt|csrf|Individual-Test-Password/i);
});

test('stale tasks cannot approve or overwrite a newer published revision; racing publishes commit once', async t => {
  const app = await fixture(t);
  await app.addUser('editor.one'); await app.addUser('admin.one', 'admin');
  const editor = await app.login('editor.one'); const admin = await app.login('admin.one');
  const first = await app.task(editor, 'Set kc-registration https://forms.gle/First');
  const second = await app.task(editor, 'Set kc-registration https://forms.gle/Second');
  assert.equal((await app.mutate(admin, first.id, 'approve')).status, 200);
  assert.equal((await app.mutate(admin, second.id, 'approve')).status, 200);
  const outcomes = await Promise.all([app.mutate(admin, first.id, 'publish'), app.mutate(admin, second.id, 'publish')]);
  assert.deepEqual(outcomes.map(result => result.status).sort(), [200, 409]);
  const loser = outcomes[0].status === 409 ? first : second;
  assert.equal((await app.mutate(admin, loser.id, 'approve')).data.code, 'STALE_REVISION');
  assert.equal((await app.mutate(admin, loser.id, 'publish')).data.code, 'STALE_REVISION');
  assert.equal((await app.request('/api/public/actions')).data.actions[0].revision, 2);
});

test('rollback is a separately approved task and cannot undo a later revision', async t => {
  const app = await fixture(t);
  await app.addUser('editor.one'); await app.addUser('admin.one', 'admin'); await app.addUser('admin.two', 'admin');
  const editor = await app.login('editor.one'); const firstAdmin = await app.login('admin.one'); const otherAdmin = await app.login('admin.two');
  const original = await app.task(editor);
  await app.mutate(firstAdmin, original.id, 'approve'); await app.mutate(firstAdmin, original.id, 'publish');
  const rollback = await app.mutate(firstAdmin, original.id, 'rollback');
  assert.equal(rollback.data.task.status, 'AWAITING_APPROVAL'); assert.equal(rollback.data.task.afterUrl, original.beforeUrl);
  assert.equal(rollback.data.task.rollbackOf, original.id);
  assert.equal((await app.mutate(firstAdmin, original.id, 'rollback')).data.task.id, rollback.data.task.id);
  assert.equal((await app.mutate(firstAdmin, rollback.data.task.id, 'approve')).data.code, 'SELF_APPROVAL');
  assert.equal((await app.request('/api/public/actions')).data.actions[0].url, original.afterUrl);
  await app.mutate(otherAdmin, rollback.data.task.id, 'approve');
  assert.equal((await app.mutate(otherAdmin, rollback.data.task.id, 'publish')).data.task.status, 'COMPLETED');
  const action = (await app.request('/api/public/actions')).data.actions[0];
  assert.equal(action.url, original.beforeUrl); assert.equal(action.revision, 3);
  const tasks = (await app.request('/api/command/tasks', { auth: editor })).data.tasks;
  assert.equal(tasks.find(item => item.id === original.id).status, 'ROLLED_BACK');
  const next = await app.task(editor, 'Set kc-registration https://forms.gle/ThirdRevision');
  await app.mutate(firstAdmin, next.id, 'approve'); await app.mutate(firstAdmin, next.id, 'publish');
  assert.equal((await app.mutate(firstAdmin, rollback.data.task.id, 'rollback')).data.code, 'STALE_REVISION');
});

test('published state, sessions, tasks and append-only audit survive service reopen', async t => {
  const app = await fixture(t); await app.addUser('editor.one'); await app.addUser('admin.one', 'admin');
  const editor = await app.login('editor.one'); const admin = await app.login('admin.one');
  const task = await app.task(editor); await app.mutate(admin, task.id, 'approve'); await app.mutate(admin, task.id, 'publish');
  app.state.service.close(); app.state.service = createCommandService({ databasePath: app.databasePath });
  assert.equal((await app.request('/api/command/session', { auth: editor })).data.user.id, editor.user.id);
  assert.equal((await app.request('/api/public/actions')).data.actions[0].url, task.afterUrl);
  assert.equal((await app.request('/api/command/tasks', { auth: editor })).data.tasks[0].status, 'COMPLETED');
  assert.equal((await app.mutate(admin, task.id, 'publish')).data.task.publishedRevision, 2);
  const db = new DatabaseSync(app.databasePath);
  assert.throws(() => db.exec("UPDATE audit_entries SET type='TAMPERED'"), /append only/);
  assert.throws(() => db.exec('DELETE FROM audit_entries'), /append only/); db.close();
});
