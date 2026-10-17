import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, CheckCircle2, ChevronRight, ClipboardCheck, Clock3, ExternalLink, FileClock, History, LayoutDashboard, Link2, Loader2, LockKeyhole, LogOut, RefreshCw, RotateCcw, Send, ShieldCheck, Terminal, X } from 'lucide-react';
import { Link } from '../lib/router.jsx';
import './CommandCenter.css';

const NAV = [
  { id: 'overview', label: 'Pusat Komando', icon: LayoutDashboard },
  { id: 'workspace', label: 'Ruang Perintah', icon: Terminal },
  { id: 'links', label: 'Registri Tautan', icon: Link2 },
  { id: 'audit', label: 'Jejak Aktivitas', icon: History },
];
const STATUS = {
  AWAITING_APPROVAL: ['Menunggu persetujuan', 'pending'],
  APPROVED: ['Disetujui', 'approved'],
  COMPLETED: ['Diterbitkan', 'complete'],
  ROLLED_BACK: ['Telah dipulihkan', 'neutral'],
};
const ROLE = { admin: 'Administrator', editor: 'Editor', approver: 'Pemberi persetujuan' };
const date = (value) => value ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Jakarta' }).format(new Date(value)) + ' WIB' : '—';
const actor = (value) => value?.name || value?.username || 'Sistem';

async function request(path, { method = 'GET', body, csrfToken } = {}) {
  const response = await fetch(`/api/command/${path}`, {
    method, credentials: 'same-origin', cache: 'no-store',
    headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  let result;
  try { result = await response.json(); } catch { throw new Error('Layanan Command Center belum tersedia pada lingkungan ini.'); }
  if (!response.ok) {
    const error = new Error(result.error || 'Permintaan belum dapat diproses.');
    error.status = response.status;
    throw error;
  }
  return result;
}

function Badge({ status }) {
  const [label, tone] = STATUS[status] || [status, 'neutral'];
  return <span className={`cc-badge cc-badge-${tone}`}><span />{label}</span>;
}

function Login({ onLogin, initialError }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(initialError || '');
  const [busy, setBusy] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    setBusy(true); setError('');
    try { onLogin(await request('login', { method: 'POST', body: { username, password } })); }
    catch (failure) { setError(failure.message); }
    finally { setPassword(''); setBusy(false); }
  };
  return <div className="cc-login">
    <div className="cc-login-story">
      <Link to="/" className="cc-login-back"><ArrowLeft size={16} /> Kembali ke portal</Link>
      <div className="cc-login-brand"><img src="/logo-menwa-unj.png" alt="Lambang Menwa UNJ" /><span>MENWA UNJ <small>COMMAND OS</small></span></div>
      <div className="cc-login-copy"><span className="cc-eyebrow">TERTIB. TERUKUR. TERARAH.</span><h1>Satu pusat.<br />{' '}Setiap langkah<br />{' '}<em>terkendali.</em></h1><p>Ruang kerja pengurus untuk mengelola informasi, meninjau perubahan, dan menjaga akuntabilitas satuan.</p></div>
      <div className="cc-login-principles"><span><ShieldCheck size={18} /> Akses sesuai peran</span><span><ClipboardCheck size={18} /> Persetujuan tercatat</span><span><History size={18} /> Riwayat terlacak</span></div>
      <p className="cc-login-unit">KOMANDO RESIMEN MAHASISWA JAYAKARTA<br />SATUAN UNIVERSITAS NEGERI JAKARTA</p>
    </div>
    <main className="cc-login-main">
      <form className="cc-login-form" onSubmit={submit}>
        <div className="cc-lock-icon"><LockKeyhole size={25} /></div>
        <span className="cc-eyebrow">AKSES PENGURUS</span><h2>Masuk ke Command Center</h2><p>Gunakan akun individual yang telah dibuat oleh administrator.</p>
        {error && <div className="cc-notice cc-error" role="alert">{error}</div>}
        <label htmlFor="cc-username">Nama pengguna</label><input id="cc-username" autoComplete="username" autoCapitalize="none" spellCheck="false" required maxLength={80} value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Nama pengguna Anda" />
        <label htmlFor="cc-password">Kata sandi</label><input id="cc-password" autoComplete="current-password" type="password" required maxLength={256} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Masukkan kata sandi" />
        <button className="cc-button cc-primary cc-login-submit" disabled={busy}>{busy ? <Loader2 size={17} className="cc-spin" /> : <ArrowRight size={17} />} {busy ? 'Memeriksa akun…' : 'Masuk ke ruang kerja'}</button>
        <div className="cc-login-info"><ShieldCheck size={17} /><span>Setiap perubahan memerlukan kewenangan dan meninggalkan jejak aktivitas.</span></div>
        <p className="cc-environment">Tahap pertama · lingkungan lokal<br />Publikasi di sini memperbarui portal pada lingkungan yang sama.</p>
      </form>
    </main>
  </div>;
}

function TaskDetail({ task, user, busy, onAction, onClose }) {
  const own = task.createdBy?.id === user.id;
  const canReview = ['admin', 'approver'].includes(user.role);
  return <section className="cc-panel cc-detail" aria-label="Pratinjau perubahan">
    <div className="cc-panel-heading"><div><span className="cc-eyebrow">PRATINJAU PERUBAHAN</span><h2>{task.actionLabel}</h2></div><button type="button" className="cc-icon-button" aria-label="Tutup pratinjau" onClick={onClose}><X size={19} /></button></div>
    <Badge status={task.status} />
    <div className="cc-url-change"><div><small>SEBELUM</small><p>{task.beforeUrl}</p></div><ArrowRight size={20} /><div><small>USULAN TUJUAN</small><p>{task.afterUrl}</p></div></div>
    <div className="cc-preview-button"><small>TAMPILAN TOMBOL</small><a href={task.afterUrl} target="_blank" rel="noopener noreferrer">{task.actionLabel} <ExternalLink size={14} /></a></div>
    <ul className="cc-validation">{(task.validation || []).map((item, index) => <li key={item.name || index} className={item.passed === true ? '' : 'cc-unverified'}>{item.passed === true ? <CheckCircle2 size={16} /> : <Clock3 size={16} />}<span>{item.message}</span></li>)}</ul>
    <p className="cc-muted">Pemeriksaan mencakup format dan kebijakan tujuan. Keterjangkauan formulir dan kepemilikannya perlu ditinjau melalui pratinjau.</p>
    <dl className="cc-meta"><div><dt>Diajukan oleh</dt><dd>{actor(task.createdBy)}</dd></div><div><dt>Waktu pengajuan</dt><dd>{date(task.createdAt)}</dd></div><div><dt>Disetujui oleh</dt><dd>{task.approvedBy ? actor(task.approvedBy) : 'Belum disetujui'}</dd></div><div><dt>ID pekerjaan</dt><dd className="cc-task-id">{task.id}</dd></div></dl>
    <div className="cc-detail-actions">
      {task.status === 'AWAITING_APPROVAL' && canReview && !own && <button className="cc-button cc-primary" disabled={busy} onClick={() => onAction(task, 'approve')}><Check size={16} /> Setujui perubahan</button>}
      {task.status === 'AWAITING_APPROVAL' && own && <p className="cc-muted"><LockKeyhole size={15} /> Pengajuan Anda perlu ditinjau pengurus lain yang berwenang.</p>}
      {task.status === 'APPROVED' && canReview && <button className="cc-button cc-primary" disabled={busy} onClick={() => onAction(task, 'publish')}><Send size={16} /> Terbitkan ke portal lokal</button>}
      {task.status === 'COMPLETED' && canReview && <button className="cc-button cc-secondary" disabled={busy} onClick={() => onAction(task, 'rollback')}><RotateCcw size={16} /> Ajukan pemulihan tujuan</button>}
    </div>
  </section>;
}

export default function CommandCenter() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [tab, setTab] = useState('overview');
  const [tasks, setTasks] = useState([]);
  const [actions, setActions] = useState([]);
  const [audit, setAudit] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [command, setCommand] = useState('');
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState('');
  const loadVersion = useRef(0);
  const sessionIdentity = useRef(null);
  sessionIdentity.current = session?.user?.id || null;
  const load = useCallback(async () => {
    const identity = sessionIdentity.current;
    if (!identity) return;
    const version = ++loadVersion.current;
    const [taskResult, actionResult, auditResult] = await Promise.all([request('tasks'), request('actions'), request('audit')]);
    if (loadVersion.current !== version || sessionIdentity.current !== identity) return;
    setTasks(taskResult.tasks); setActions(actionResult.actions); setAudit(auditResult.entries);
  }, []);
  useEffect(() => {
    const title = document.title;
    document.title = 'Command Center | Menwa UNJ';
    let active = true;
    request('session').then((value) => { if (active) setSession(value.user ? value : null); }).catch((failure) => { if (active) setError(failure.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; document.title = title; };
  }, []);
  useEffect(() => {
    let active = true;
    if (session?.user) load().catch((failure) => { if (active) { setError(failure.message); if (failure.status === 401) setSession(null); } });
    return () => { active = false; loadVersion.current++; };
  }, [session, load]);
  const run = async (operation) => {
    setBusy(true); setError(''); setNotice('');
    try { await operation(); }
    catch (failure) {
      setError(failure.message);
      if (failure.status === 401) setSession(null);
      if (failure.status === 409) await load().catch(() => {});
    }
    finally { setBusy(false); }
  };
  const submit = (event) => {
    event.preventDefault();
    run(async () => {
      const result = await request('tasks', { method: 'POST', body: { command }, csrfToken: session.csrfToken });
      await load(); setSelectedId(result.task.id); setCommand('');
      setNotice('Usulan berhasil disiapkan. Tujuan tombol belum berubah; menunggu persetujuan pengurus lain.');
    });
  };
  const taskAction = (task, action) => run(async () => {
    const result = await request(`tasks/${encodeURIComponent(task.id)}/${action}`, { method: 'POST', body: {}, csrfToken: session.csrfToken });
    await load(); setSelectedId(result.task.id);
    setNotice(action === 'approve' ? 'Revisi ini telah disetujui. Tinjau kembali lalu terbitkan ke portal lokal.' : action === 'publish' ? 'Tujuan telah diterbitkan pada lingkungan lokal dan tercatat di riwayat.' : 'Usulan pemulihan dibuat. Pengurus lain perlu menyetujui sebelum tujuan dipulihkan.');
    if (action === 'publish') window.dispatchEvent(new Event('command:published'));
  });
  if (loading) return <div className="cc-loading" role="status"><Loader2 className="cc-spin" /> Memeriksa sesi pengurus…</div>;
  if (!session?.user) return <Login initialError={error} onLogin={(value) => { setError(''); setSession(value); }} />;
  const user = session.user;
  const canCreate = ['admin', 'editor'].includes(user.role);
  const pending = tasks.filter((task) => task.status === 'AWAITING_APPROVAL');
  const selected = tasks.find((task) => task.id === selectedId);
  const filtered = tasks.filter((task) => `${task.actionLabel} ${task.id} ${actor(task.createdBy)}`.toLowerCase().includes(filter.toLowerCase()));
  const title = NAV.find((item) => item.id === tab)?.label;
  return <div className="cc-shell">
    <aside className="cc-sidebar">
      <div className="cc-brand"><img src="/logo-menwa-unj.png" alt="Menwa UNJ" /><div>MENWA UNJ<span>COMMAND CENTER</span></div></div>
      <div className="cc-sidebar-label">RUANG OPERASI</div>
      <nav aria-label="Modul Command Center">{NAV.map(({ id, label, icon: Icon }) => <button type="button" key={id} className={tab === id ? 'is-active' : ''} aria-current={tab === id ? 'page' : undefined} onClick={() => { setTab(id); setSelectedId(null); }}><Icon size={18} /><span>{label}</span>{id === 'workspace' && pending.length > 0 && <small>{pending.length}</small>}</button>)}</nav>
      <div className="cc-sidebar-note"><ShieldCheck size={21} /><strong>Kendali tetap pada pengurus.</strong><p>Perintah menyiapkan usulan. Persetujuan dan penerbitan mengikuti kewenangan.</p></div>
      <Link to="/" className="cc-portal-link"><ArrowLeft size={16} /> Kembali ke portal</Link>
      <div className="cc-user"><span className="cc-avatar">{user.name.slice(0, 1).toUpperCase()}</span><div><strong>{user.name}</strong><small>{ROLE[user.role]}</small></div><button type="button" className="cc-icon-button" aria-label="Keluar dari akun" disabled={busy} onClick={() => run(async () => { await request('logout', { method: 'POST', body: {}, csrfToken: session.csrfToken }); setSession(null); setTasks([]); setActions([]); setAudit([]); setSelectedId(null); setCommand(''); })}><LogOut size={17} /></button></div>
    </aside>
    <div className="cc-body">
      <header className="cc-topbar"><div>Ruang Operasi <ChevronRight size={13} /><strong>{title}</strong></div><Link to="/" className="cc-mobile-portal"><ArrowLeft size={13} />Portal</Link><span><span className="cc-online-dot" /> Lingkungan lokal</span></header>
      <main className="cc-content" id="command-main">
        <div className="cc-page-heading"><div><span className="cc-eyebrow">MENWA UNJ / OPERASI DIGITAL</span><h1>{title}</h1><p>{tab === 'overview' ? 'Pantau pekerjaan dan perubahan informasi dalam satu ruang.' : tab === 'workspace' ? 'Sampaikan perubahan. Tinjau hasilnya. Terbitkan dengan persetujuan.' : tab === 'links' ? 'Tujuan tombol yang sedang digunakan oleh portal pada lingkungan ini.' : 'Setiap tindakan tercatat bersama pelaku dan waktunya.'}</p></div><button className="cc-button cc-secondary" disabled={busy} onClick={() => run(load)}><RefreshCw size={15} className={busy ? 'cc-spin' : ''} /> Muat ulang</button></div>
        {error && <div className="cc-notice cc-error" role="alert">{error}</div>}
        {notice && <div className="cc-notice cc-success" role="status"><CheckCircle2 size={17} />{notice}</div>}
        <div className="cc-local-banner"><ShieldCheck size={16} /><span>Data tersimpan pada perangkat ini. Penerbitan memperbarui portal lokal; layanan produksi belum terhubung.</span></div>
        {tab === 'overview' && <>
          <div className="cc-stats">{[
            [Clock3, pending.length, 'Menunggu persetujuan', 'amber'],
            [ClipboardCheck, tasks.filter((t) => t.status === 'APPROVED').length, 'Siap diterbitkan', 'teal'],
            [Link2, actions.length, 'Tautan terdaftar', 'green'],
            [FileClock, audit.length, 'Aktivitas terakhir', 'slate'],
          ].map(([Icon, number, label, tone]) => <div className="cc-stat" key={label}><span className={`cc-stat-icon cc-tone-${tone}`}><Icon size={20} /></span><strong>{number}</strong><span>{label}</span></div>)}</div>
          <section className="cc-command-card"><div><span className="cc-eyebrow">DARI INSTRUKSI KE TINDAKAN</span><h2>Perbarui tautan tanpa mengubah halaman.</h2><p>Registrasi KC, Youth Spark, dan formulir jersey dikelola melalui usulan yang dapat ditinjau.</p><button className="cc-button cc-gold" onClick={() => setTab('workspace')}>Buka ruang perintah <ArrowRight size={16} /></button></div><div className="cc-flow" aria-label="Alur penerbitan"><span><Terminal size={19} /> Perintah</span><ChevronRight size={15} /><span><ClipboardCheck size={19} /> Tinjauan</span><ChevronRight size={15} /><span><CheckCircle2 size={19} /> Terbit</span></div></section>
        </>}
        {(tab === 'workspace') && <section className="cc-panel cc-composer"><div className="cc-panel-heading"><div><span className="cc-eyebrow">PERINTAH BARU</span><h2>Perubahan apa yang diperlukan?</h2></div><Terminal size={22} /></div>
          {canCreate ? <form onSubmit={submit}><label className="cc-sr-only" htmlFor="cc-command">Instruksi perubahan tautan</label><textarea id="cc-command" value={command} maxLength={2000} required onChange={(e) => setCommand(e.target.value)} placeholder="Contoh: Ubah tautan pendaftaran Youth Spark menjadi https://forms.gle/…" rows={3} /><div className="cc-composer-footer"><p>Sertakan nama aksi dan URL lengkap. Tujuan baru: Google Forms.</p><button className="cc-button cc-primary" disabled={busy || !command.trim()}><Send size={16} /> Siapkan usulan</button></div></form> : <p className="cc-muted">Peran Anda meninjau dan menerbitkan usulan. Pengajuan perubahan dibuat oleh editor atau administrator.</p>}
          <div className="cc-example-actions">{['pendaftaran KC', 'pendaftaran Youth Spark', 'jersey peserta', 'jersey official'].map((label) => <button type="button" key={label} disabled={!canCreate || busy} onClick={() => setCommand(`Ubah tautan ${label} menjadi `)}>{label}</button>)}</div>
        </section>}
        {(tab === 'overview' || tab === 'workspace') && <>
          <section className="cc-panel"><div className="cc-panel-heading"><div><span className="cc-eyebrow">PEKERJAAN TERKINI</span><h2>{tab === 'overview' ? 'Perubahan dalam proses' : 'Daftar pengajuan'}</h2></div><label className="cc-filter"><span className="cc-sr-only">Cari pekerjaan</span><input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Cari pekerjaan…" /></label></div>
            {filtered.length ? <div className="cc-task-list">{filtered.map((task) => <button type="button" key={task.id} className={selectedId === task.id ? 'is-selected' : ''} onClick={() => setSelectedId(task.id)}><span className="cc-task-icon"><Link2 size={18} /></span><div><strong>{task.actionLabel}</strong><small>{actor(task.createdBy)} · {date(task.createdAt)}</small></div><Badge status={task.status} /><ChevronRight size={17} /></button>)}</div> : <div className="cc-empty"><FileClock size={31} /><h3>{filter ? 'Tidak ada hasil yang sesuai' : 'Belum ada pengajuan'}</h3><p>{filter ? 'Coba nama aksi atau pengurus yang lain.' : 'Pengajuan perubahan akan tampil di sini untuk ditinjau.'}</p></div>}
          </section>
          {selected && <TaskDetail task={selected} user={user} busy={busy} onAction={taskAction} onClose={() => setSelectedId(null)} />}
        </>}
        {tab === 'links' && <section className="cc-panel"><div className="cc-panel-heading"><div><span className="cc-eyebrow">TUJUAN AKTIF</span><h2>Registri publikasi</h2></div><span className="cc-count">{actions.length} aksi</span></div><div className="cc-link-list">{actions.map((action) => <article key={action.id}><span className="cc-task-icon"><Link2 size={19} /></span><div><h3>{action.label}</h3><a href={action.url} target="_blank" rel="noopener noreferrer">{action.url} <ExternalLink size={13} /></a><small>Revisi {action.revision} · {action.updatedAt ? date(action.updatedAt) : 'Nilai awal dari repository'}</small></div><button className="cc-button cc-secondary" disabled={!canCreate} onClick={() => { setCommand(`Ubah tautan ${action.id} menjadi `); setTab('workspace'); }}>Usulkan perubahan</button></article>)}</div><p className="cc-panel-footnote">Nilai awal berasal dari sumber situs saat audit. Registri ini tidak menyatakan ulang verifikasi kepemilikan atau keterjangkauan formulir.</p></section>}
        {tab === 'audit' && <section className="cc-panel"><div className="cc-panel-heading"><div><span className="cc-eyebrow">AKUNTABILITAS</span><h2>Riwayat aktivitas</h2></div><History size={22} /></div>{audit.length ? <ol className="cc-audit-list">{audit.map((entry) => <li key={entry.id}><span className="cc-audit-dot" /><div><strong>{({ USER_CREATED: 'Akun dibuat', LOGIN_SUCCEEDED: 'Pengurus masuk', LOGIN_FAILED: 'Percobaan masuk ditolak', LOGOUT: 'Pengurus keluar', TASK_CREATED: 'Usulan disiapkan', TASK_APPROVED: 'Perubahan disetujui', TASK_PUBLISHED: 'Tujuan diterbitkan', ROLLBACK_REQUESTED: 'Pemulihan diajukan' })[entry.type] || entry.type}</strong><p>{actor(entry.actor)}{entry.actionId ? ` · ${entry.actionId}` : ''}</p><small>{date(entry.createdAt)}</small>{entry.taskId && <code>{entry.taskId}</code>}</div></li>)}</ol> : <div className="cc-empty"><History size={30} /><h3>Belum ada aktivitas</h3></div>}</section>}
        <footer className="cc-page-footer"><span>MENWA UNJ COMMAND OS</span><span>Fondasi & registri tautan · Tahap 01</span></footer>
      </main>
    </div>
  </div>;
}

