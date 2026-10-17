import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, chmodSync } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { ACTION_BASELINES, CommandError, parseCommand, validateDestination } from './actions.mjs';
import { ROLES, digest, hashPassword, normalizeUsername, randomToken, readJson, requireSameOrigin, sameToken, verifyPassword } from './security.mjs';

const COOKIE = 'menwa_command_session';
const publicUser = row => row ? { id: row.id, username: row.username, name: row.name, role: row.role } : null;

export function createCommandService({
  databasePath = process.env.COMMAND_DATABASE_PATH || path.resolve('.command-os/command.sqlite'),
  now = Date.now, sessionTtlMs = 8 * 60 * 60 * 1000, loginMaxAttempts = 10,
  loginWindowMs = 15 * 60 * 1000, secureCookies = false,
} = {}) {
  if (databasePath !== ':memory:') mkdirSync(path.dirname(path.resolve(databasePath)), { recursive: true, mode: 0o700 });
  const db = new DatabaseSync(databasePath);
  if (databasePath !== ':memory:') { try { chmodSync(databasePath, 0o600); } catch { /* Windows uses filesystem ACLs. */ } }
  db.exec(`
    PRAGMA foreign_keys = ON;
    PRAGMA busy_timeout = 5000;
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY, username TEXT UNIQUE NOT NULL, name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('editor','approver','admin')),
      password_salt TEXT NOT NULL, password_hash TEXT NOT NULL, created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id),
      csrf_token TEXT NOT NULL, expires_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS actions (
      id TEXT PRIMARY KEY, label TEXT NOT NULL, url TEXT NOT NULL,
      revision INTEGER NOT NULL CHECK(revision > 0), updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY, action_id TEXT NOT NULL REFERENCES actions(id), action_label TEXT NOT NULL,
      command TEXT NOT NULL, before_url TEXT NOT NULL, after_url TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('AWAITING_APPROVAL','APPROVED','COMPLETED','ROLLED_BACK')),
      validation_json TEXT NOT NULL, base_revision INTEGER NOT NULL,
      created_by TEXT NOT NULL REFERENCES users(id), created_at TEXT NOT NULL,
      approved_by TEXT REFERENCES users(id), approved_at TEXT, published_at TEXT,
      published_revision INTEGER, rollback_of TEXT REFERENCES tasks(id)
    );
    CREATE TABLE IF NOT EXISTS audit_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT, actor_id TEXT REFERENCES users(id),
      type TEXT NOT NULL, action_id TEXT, task_id TEXT, details_json TEXT NOT NULL, created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS login_limits (
      key TEXT PRIMARY KEY, window_start INTEGER NOT NULL, attempts INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS tasks_action ON tasks(action_id);
    CREATE INDEX IF NOT EXISTS sessions_expiry ON sessions(expires_at);
    CREATE TRIGGER IF NOT EXISTS audit_no_update BEFORE UPDATE ON audit_entries BEGIN SELECT RAISE(ABORT, 'audit is append only'); END;
    CREATE TRIGGER IF NOT EXISTS audit_no_delete BEFORE DELETE ON audit_entries BEGIN SELECT RAISE(ABORT, 'audit is append only'); END;
    PRAGMA user_version = 1;
  `);
  let closed = false;
  const timestamp = () => new Date(Number(now())).toISOString();
  const transaction = fn => {
    db.exec('BEGIN IMMEDIATE');
    try { const value = fn(); db.exec('COMMIT'); return value; }
    catch (error) { db.exec('ROLLBACK'); throw error; }
  };
  const audit = (actorId, type, actionId = null, taskId = null, details = {}) => {
    db.prepare('INSERT INTO audit_entries(actor_id,type,action_id,task_id,details_json,created_at) VALUES (?,?,?,?,?,?)')
      .run(actorId, type, actionId, taskId, JSON.stringify(details), timestamp());
  };
  transaction(() => {
    const insert = db.prepare('INSERT OR IGNORE INTO actions(id,label,url,revision,updated_at) VALUES (?,?,?,1,?)');
    for (const action of ACTION_BASELINES) insert.run(action.id, action.label, action.url, timestamp());
  });

  const userById = id => publicUser(db.prepare('SELECT id,username,name,role FROM users WHERE id=?').get(id));
  const actionById = id => {
    const row = db.prepare('SELECT id,label,url,revision,updated_at FROM actions WHERE id=?').get(id);
    return row ? { id: row.id, label: row.label, url: row.url, revision: row.revision, updatedAt: row.updated_at } : null;
  };
  const taskById = id => {
    const row = db.prepare('SELECT * FROM tasks WHERE id=?').get(id);
    return row ? {
      id: row.id, actionId: row.action_id, actionLabel: row.action_label, command: row.command,
      beforeUrl: row.before_url, afterUrl: row.after_url, status: row.status,
      validation: JSON.parse(row.validation_json), baseRevision: row.base_revision,
      createdBy: userById(row.created_by), createdAt: row.created_at,
      approvedBy: row.approved_by ? userById(row.approved_by) : null, approvedAt: row.approved_at,
      publishedAt: row.published_at, publishedRevision: row.published_revision, rollbackOf: row.rollback_of,
    } : null;
  };
  const requireTask = id => {
    const task = taskById(id);
    if (!task) throw new CommandError(404, 'TASK_NOT_FOUND', 'Tugas tidak ditemukan.');
    return task;
  };
  const requireReviewer = user => {
    if (!['admin', 'approver'].includes(user.role)) throw new CommandError(403, 'ROLE_REQUIRED', 'Tindakan ini memerlukan peran approver atau admin.');
  };
  const requireCurrentRevision = task => {
    const action = actionById(task.actionId);
    if (action.revision !== task.baseRevision || action.url !== task.beforeUrl) {
      throw new CommandError(409, 'STALE_REVISION', 'Aksi sudah berubah sejak tugas dibuat. Muat ulang dan buat tugas baru berdasarkan revisi terbaru.');
    }
    return action;
  };
  const insertTask = (user, command, parsed, { rollbackOf = null } = {}) => {
    const action = actionById(parsed.actionId);
    if (action.url === parsed.afterUrl) throw new CommandError(422, 'NO_CHANGE', 'URL tujuan sama dengan URL yang sedang dipublikasikan.');
    const id = randomUUID();
    db.prepare(`INSERT INTO tasks(id,action_id,action_label,command,before_url,after_url,status,validation_json,base_revision,created_by,created_at,rollback_of)
      VALUES (?,?,?,?,?,?,'AWAITING_APPROVAL',?,?,?,?,?)`)
      .run(id, action.id, action.label, command, action.url, parsed.afterUrl, JSON.stringify(parsed.validation), action.revision, user.id, timestamp(), rollbackOf);
    audit(user.id, rollbackOf ? 'ROLLBACK_REQUESTED' : 'TASK_CREATED', action.id, id,
      { beforeUrl: action.url, afterUrl: parsed.afterUrl, baseRevision: action.revision, rollbackOf });
    return taskById(id);
  };

  async function createUser({ username, name, password, role = 'editor' }) {
    if (closed) throw new CommandError(503, 'SERVICE_CLOSED', 'Layanan telah ditutup.');
    const normalized = normalizeUsername(username);
    if (!ROLES.includes(role)) throw new CommandError(422, 'INVALID_ROLE', 'Peran harus editor, approver, atau admin.');
    if (typeof name !== 'string' || !name.trim() || name.trim().length > 120) throw new CommandError(422, 'INVALID_NAME', 'Nama wajib diisi, maksimal 120 karakter.');
    if (db.prepare('SELECT id FROM users WHERE username=?').get(normalized)) throw new CommandError(409, 'USERNAME_EXISTS', 'Username sudah digunakan.');
    const credentials = await hashPassword(password);
    return transaction(() => {
      if (db.prepare('SELECT id FROM users WHERE username=?').get(normalized)) throw new CommandError(409, 'USERNAME_EXISTS', 'Username sudah digunakan.');
      const id = randomUUID();
      db.prepare('INSERT INTO users(id,username,name,role,password_salt,password_hash,created_at) VALUES (?,?,?,?,?,?,?)')
        .run(id, normalized, name.trim(), role, credentials.salt, credentials.hash, timestamp());
      audit(null, 'USER_CREATED', null, null, { userId: id, username: normalized, role, source: 'local-cli' });
      return userById(id);
    });
  }

  const currentSession = req => {
    const rawCookie = (req.headers.cookie || '').split(';').map(value => value.trim()).find(value => value.startsWith(`${COOKIE}=`));
    if (!rawCookie) return null;
    const token = rawCookie.slice(COOKIE.length + 1);
    if (!/^[A-Za-z0-9_-]{43}$/.test(token)) return null;
    const hash = digest(token);
    const row = db.prepare('SELECT user_id,csrf_token,expires_at FROM sessions WHERE token_hash=?').get(hash);
    if (!row) return null;
    if (row.expires_at <= Number(now())) { db.prepare('DELETE FROM sessions WHERE token_hash=?').run(hash); return null; }
    return { hash, csrfToken: row.csrf_token, user: userById(row.user_id) };
  };
  const setCookie = (req, res, token, maxAge) => {
    res.setHeader('Set-Cookie', `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secureCookies || req.socket?.encrypted ? '; Secure' : ''}`);
  };
  const enforceLoginLimit = (req, username) => {
    // Never trust X-Forwarded-For in this local backend.
    const keys = [digest(`ip:${req.socket?.remoteAddress || 'local'}`), digest(`username:${username}`)];
    const time = Number(now());
    transaction(() => {
      db.prepare('DELETE FROM login_limits WHERE window_start<?').run(time - loginWindowMs);
      for (const key of keys) {
        const prior = db.prepare('SELECT attempts FROM login_limits WHERE key=?').get(key);
        if (prior && prior.attempts >= loginMaxAttempts) throw new CommandError(429, 'LOGIN_RATE_LIMIT', 'Terlalu banyak percobaan masuk. Coba kembali setelah 15 menit.');
      }
      for (const key of keys) db.prepare(`INSERT INTO login_limits(key,window_start,attempts) VALUES (?,?,1)
        ON CONFLICT(key) DO UPDATE SET attempts=attempts+1`).run(key, time);
    });
  };

  async function handler(req, res, next) {
    let pathname;
    try { pathname = new URL(req.url, 'http://command.local').pathname.replace(/\/+$/, '') || '/'; }
    catch { if (next) next(); return false; }
    if (!(pathname.startsWith('/api/command/') || pathname === '/api/command' || pathname === '/api/public/actions')) {
      if (next) next(); return false;
    }
    const send = (status, value) => {
      res.statusCode = status;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.end(JSON.stringify(value));
      return true;
    };
    try {
      if (closed) throw new CommandError(503, 'SERVICE_CLOSED', 'Layanan Command OS tidak tersedia.');
      if (!['GET', 'POST'].includes(req.method)) { res.setHeader('Allow', 'GET, POST'); throw new CommandError(405, 'METHOD_NOT_ALLOWED', 'Metode permintaan tidak diizinkan.'); }
      if (pathname === '/api/public/actions') {
        if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); throw new CommandError(405, 'METHOD_NOT_ALLOWED', 'Gunakan GET.'); }
        return send(200, { actions: db.prepare('SELECT id,label,url,revision,updated_at FROM actions ORDER BY rowid').all().map(row => ({ id: row.id, label: row.label, url: row.url, revision: row.revision, updatedAt: row.updated_at })) });
      }
      if (req.method === 'POST') requireSameOrigin(req);
      if (pathname === '/api/command/login' && req.method === 'POST') {
        const body = await readJson(req);
        const username = typeof body.username === 'string' ? body.username.trim().toLowerCase().slice(0, 64) : '';
        enforceLoginLimit(req, username);
        const row = db.prepare('SELECT * FROM users WHERE username=?').get(username);
        if (!(await verifyPassword(body.password, row))) {
          audit(null, 'LOGIN_FAILED', null, null, {});
          throw new CommandError(401, 'INVALID_CREDENTIALS', 'Username atau kata sandi tidak cocok.');
        }
        const token = randomToken(); const csrfToken = randomToken();
        transaction(() => {
          // Rotate any existing browser session when logging in again.
          const oldSession = currentSession(req);
          if (oldSession) db.prepare('DELETE FROM sessions WHERE token_hash=?').run(oldSession.hash);
          db.prepare('DELETE FROM sessions WHERE expires_at<=?').run(Number(now()));
          db.prepare('INSERT INTO sessions(token_hash,user_id,csrf_token,expires_at) VALUES (?,?,?,?)').run(digest(token), row.id, csrfToken, Number(now()) + sessionTtlMs);
          audit(row.id, 'LOGIN_SUCCEEDED');
        });
        setCookie(req, res, token, Math.floor(sessionTtlMs / 1000));
        return send(200, { user: publicUser(row), csrfToken });
      }
      const session = currentSession(req);
      if (pathname === '/api/command/session' && req.method === 'GET') return send(200, { user: session?.user || null, csrfToken: session?.csrfToken || null });
      if (!session?.user) throw new CommandError(401, 'AUTH_REQUIRED', 'Masuk dengan akun individual untuk mengakses Command OS.');
      if (req.method === 'POST' && !sameToken(req.headers['x-csrf-token'], session.csrfToken)) throw new CommandError(403, 'CSRF_REQUIRED', 'Token keamanan tidak cocok. Muat ulang sesi dan coba kembali.');
      const user = session.user;
      if (pathname === '/api/command/logout' && req.method === 'POST') {
        db.prepare('DELETE FROM sessions WHERE token_hash=?').run(session.hash);
        setCookie(req, res, '', 0); audit(user.id, 'LOGOUT');
        return send(200, { ok: true });
      }
      if (pathname === '/api/command/actions' && req.method === 'GET') return send(200, { actions: ACTION_BASELINES.map(action => actionById(action.id)) });
      if (pathname === '/api/command/tasks' && req.method === 'GET') return send(200, { tasks: db.prepare('SELECT id FROM tasks ORDER BY rowid DESC LIMIT 200').all().map(row => taskById(row.id)) });
      if (pathname === '/api/command/audit' && req.method === 'GET') {
        const entries = db.prepare('SELECT * FROM audit_entries ORDER BY id DESC LIMIT 500').all().map(row => ({ id: row.id, actor: row.actor_id ? userById(row.actor_id) : null, type: row.type, actionId: row.action_id, taskId: row.task_id, details: JSON.parse(row.details_json), createdAt: row.created_at }));
        return send(200, { entries });
      }
      if (pathname === '/api/command/tasks' && req.method === 'POST') {
        if (!['editor', 'admin'].includes(user.role)) throw new CommandError(403, 'ROLE_REQUIRED', 'Pembuatan perintah memerlukan peran editor atau admin.');
        const body = await readJson(req); const parsed = parseCommand(body.command);
        return send(201, { task: transaction(() => insertTask(user, body.command, parsed)) });
      }
      const match = pathname.match(/^\/api\/command\/tasks\/([A-Za-z0-9-]+)\/(approve|publish|rollback)$/);
      if (match && req.method === 'POST') {
        requireReviewer(user); await readJson(req);
        const [, id, operation] = match;
        const task = transaction(() => {
          const current = requireTask(id);
          if (operation === 'approve') {
            if (current.createdBy.id === user.id) throw new CommandError(403, 'SELF_APPROVAL', 'Pembuat tugas tidak dapat menyetujui tugasnya sendiri. Minta approver atau admin lain.');
            if (!['AWAITING_APPROVAL', 'APPROVED'].includes(current.status)) throw new CommandError(409, 'TASK_STATE', 'Tugas ini tidak menunggu persetujuan.');
            requireCurrentRevision(current);
            if (current.status === 'APPROVED') return current;
            db.prepare("UPDATE tasks SET status='APPROVED',approved_by=?,approved_at=? WHERE id=?").run(user.id, timestamp(), id);
            audit(user.id, 'TASK_APPROVED', current.actionId, id, { baseRevision: current.baseRevision });
            return taskById(id);
          }
          if (operation === 'publish') {
            if (['COMPLETED', 'ROLLED_BACK'].includes(current.status)) return current;
            if (current.status !== 'APPROVED') throw new CommandError(409, 'APPROVAL_REQUIRED', 'Publikasi memerlukan persetujuan terlebih dahulu.');
            if (!current.approvedBy || current.approvedBy.id === current.createdBy.id) throw new CommandError(409, 'APPROVAL_REQUIRED', 'Persetujuan harus berasal dari orang yang berbeda dengan pembuat tugas.');
            const action = requireCurrentRevision(current);
            validateDestination(current.afterUrl, { restoreBaseline: Boolean(current.rollbackOf) });
            const publicationTime = timestamp();
            const result = db.prepare('UPDATE actions SET url=?,revision=revision+1,updated_at=? WHERE id=? AND revision=?')
              .run(current.afterUrl, publicationTime, action.id, current.baseRevision);
            if (Number(result.changes) !== 1) throw new CommandError(409, 'STALE_REVISION', 'Revisi aksi sudah berubah. Muat ulang dan buat tugas baru.');
            db.prepare("UPDATE tasks SET status='COMPLETED',published_at=?,published_revision=? WHERE id=?").run(publicationTime, action.revision + 1, id);
            if (current.rollbackOf) db.prepare("UPDATE tasks SET status='ROLLED_BACK' WHERE id=?").run(current.rollbackOf);
            audit(user.id, 'TASK_PUBLISHED', action.id, id, { beforeUrl: current.beforeUrl, afterUrl: current.afterUrl, revision: action.revision + 1, rollbackOf: current.rollbackOf });
            return taskById(id);
          }
          const previousRollback = db.prepare('SELECT id FROM tasks WHERE rollback_of=? ORDER BY rowid DESC LIMIT 1').get(id);
          if (previousRollback) {
            const prior = taskById(previousRollback.id);
            const action = actionById(current.actionId);
            if (['COMPLETED', 'ROLLED_BACK'].includes(prior.status) || (prior.baseRevision === action.revision && prior.beforeUrl === action.url)) return prior;
          }
          if (current.status !== 'COMPLETED') throw new CommandError(409, 'TASK_STATE', 'Hanya publikasi yang selesai dan masih aktif yang dapat diminta pemulihannya.');
          const action = actionById(current.actionId);
          if (action.revision !== current.publishedRevision || action.url !== current.afterUrl) throw new CommandError(409, 'STALE_REVISION', 'Aksi telah berubah setelah publikasi ini. Pemulihan lama tidak dapat menimpa revisi terbaru.');
          return insertTask(user, `Permintaan pemulihan publikasi ${id}`, {
            actionId: current.actionId, afterUrl: current.beforeUrl,
            validation: [{ name: 'rollback', passed: true, message: 'Pemulihan memerlukan persetujuan baru dari orang lain.' }, ...validateDestination(current.beforeUrl, { restoreBaseline: true })],
          }, { rollbackOf: current.id });
        });
        return send(200, { task });
      }
      throw new CommandError(404, 'NOT_FOUND', 'Rute Command OS tidak ditemukan.');
    } catch (error) {
      if (error instanceof CommandError) return send(error.status, { error: error.message, code: error.code });
      return send(500, { error: 'Layanan tidak dapat menyelesaikan permintaan. Muat ulang status tugas sebelum mencoba kembali.', code: 'INTERNAL_ERROR' });
    }
  }
  return { handler, createUser, close() { if (!closed) { closed = true; db.close(); } } };
}
