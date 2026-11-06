import assert from 'node:assert/strict';
import handler from '../api/search.js';

const oldKey = process.env.GEMINI_API_KEY;
delete process.env.GEMINI_API_KEY;
const samples = [
  ['mau pesan kaos untuk pendamping', '/kc'],
  ['jadwal tanya jawab seminar', '/youth-spark/seminar-webinar'],
  ['siapa komandan menwa unj', '/garis-komando'],
  ['alamat mako dan nomor telepon', '/mako'],
  ['surat izin kegiatan', '/administrasi'],
  ['ada info diksarmil', '/pendidikan'],
];
for (const [query, expected] of samples) {
  let result;
  await handler({method:'POST',body:{query}}, {
    setHeader(){}, status(){return {json(value){result=value;return value;}}}
  });
  assert.equal(result.path, expected, `Fallback query '${query}'`);
  assert.deepEqual(Object.keys(result), ['path']);
}
let status;
await handler({method:'GET',body:{}}, {setHeader(){},status(code){status=code;return {json(value){return value;}}}});
assert.equal(status,405);
if (oldKey !== undefined) process.env.GEMINI_API_KEY = oldKey;
console.log('Validasi AI Navigator lulus: 6 kalimat bebas diarahkan ke rute lokal dan method 405.');
