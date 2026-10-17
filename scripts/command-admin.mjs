import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { stdin, stdout, stderr } from 'node:process';
import { createCommandService } from '../server/command/service.mjs';

const USAGE = 'node scripts/command-admin.mjs create-user --username nama.individual --name "Nama Lengkap" --role editor|approver|admin [--database path]';

export function parseArguments(argv) {
  if (argv[0] !== 'create-user') throw new Error(USAGE);
  const options = {};
  const accepted = new Set(['--username', '--name', '--role', '--database']);
  for (let i = 1; i < argv.length; i += 2) {
    const flag = argv[i]; const value = argv[i + 1];
    if (!accepted.has(flag) || !value || value.startsWith('--') || options[flag]) throw new Error(USAGE);
    options[flag] = value;
  }
  if (!options['--username'] || !options['--name'] || !options['--role']) throw new Error(USAGE);
  return { username: options['--username'], name: options['--name'], role: options['--role'], databasePath: options['--database'] || process.env.COMMAND_DATABASE_PATH || path.resolve('.command-os/command.sqlite') };
}

export function readHiddenPassword(prompt, input = stdin, output = stdout) {
  if (!input.isTTY || !output.isTTY || typeof input.setRawMode !== 'function') {
    return Promise.reject(new Error('Jalankan CLI di terminal interaktif. Kata sandi tidak diterima lewat argumen, environment, atau input pipe.'));
  }
  output.write(prompt);
  const wasRaw = input.isRaw;
  input.setRawMode(true); input.resume(); input.setEncoding('utf8');
  return new Promise((resolve, reject) => {
    let value = '';
    const cleanup = () => { input.off('data', onData); input.setRawMode(Boolean(wasRaw)); input.pause(); output.write('\n'); };
    const onData = text => {
      for (const character of text) {
        if (character === '\u0003' || character === '\u0004') { cleanup(); reject(new Error('Pembuatan akun dibatalkan.')); return; }
        if (character === '\r' || character === '\n') { cleanup(); resolve(value); return; }
        if (character === '\u007f' || character === '\b') value = [...value].slice(0, -1).join('');
        else if (character >= ' ' && character !== '\u001b' && value.length < 257) value += character;
      }
    };
    input.on('data', onData);
  });
}

export async function main(argv = process.argv.slice(2)) {
  if (argv.includes('--help') || argv.includes('-h')) { stdout.write(`${USAGE}\n`); return; }
  const options = parseArguments(argv);
  const password = await readHiddenPassword('Kata sandi individual (minimal 12 karakter): ');
  const confirmation = await readHiddenPassword('Ulangi kata sandi: ');
  if (password !== confirmation) throw new Error('Konfirmasi kata sandi tidak cocok. Akun belum dibuat.');
  const service = createCommandService({ databasePath: options.databasePath });
  try {
    const user = await service.createUser({ username: options.username, name: options.name, role: options.role, password });
    stdout.write(`Akun individual dibuat: ${user.username} (${user.role}). Database lokal: ${path.resolve(options.databasePath)}\n`);
  } finally { service.close(); }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch(error => { stderr.write(`${error.message || 'Pembuatan akun gagal.'}\n`); process.exitCode = 1; });
}
