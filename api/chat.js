const DESTINATIONS = [
  { label: 'Beranda', path: '/', keywords: ['beranda', 'home', 'program', 'kegiatan', 'sorotan'] },
  { label: 'Garis Komando', path: '/garis-komando', keywords: ['struktur', 'komando', 'pimpinan', 'organisasi', 'staf'] },
  { label: 'Pendidikan & Pelatihan', path: '/pendidikan', keywords: ['pendidikan', 'latihan', 'diklat', 'provos'] },
  { label: 'Markas Komando', path: '/mako', keywords: ['mako', 'alamat', 'lokasi', 'kontak', 'piket'] },
  { label: 'Administrasi Umum', path: '/administrasi', keywords: ['administrasi', 'surat', 'permohonan', 'layanan'] },
  { label: 'Ksatria Cendekia VIII', path: '/kc', keywords: ['ksatria', 'cendekia', 'kc', 'lomba'] },
  { label: 'Youth Spark National', path: '/youth-spark', keywords: ['youth spark', 'youth spark national', 'dispora', 'umkm', 'seminar'] },
  { label: 'Seminar & Webinar Youth Spark', path: '/youth-spark/seminar-webinar', keywords: ['seminar webinar', 'seminar youth spark', 'webinar'] },
  { label: 'Kompetisi Youth Spark', path: '/youth-spark/kompetisi', keywords: ['kompetisi youth spark', 'kompetisi'] },
  { label: 'Pelatihan Pelatih Youth Spark', path: '/youth-spark/pelatihan-pelatih', keywords: ['pelatihan pelatih', 'pelatih'] },
];

const fallback = (message) => {
  const q = message.toLowerCase();
  const hit = DESTINATIONS.find(d => d.keywords.some(k => q.includes(k)));
  if (q.includes('daftar') && q.includes('kc')) return { text: 'Untuk pendaftaran Ksatria Cendekia VIII, buka subtab Ksatria Cendekia agar informasi kegiatan dan pendaftaran tersedia di satu halaman.', suggestions: [{label:'Buka Ksatria Cendekia VIII',path:'/kc'}] };
  if (q.includes('seminar') && q.includes('youth spark')) return { text: 'Seminar Youth Spark berlangsung 24 Oktober 2026 di Aula Latief Hendraningrat UNJ, pukul 08.00–12.00 WIB.', suggestions: [{label:'Buka Seminar & Webinar',path:'/youth-spark/seminar-webinar'}] };
  if (q.includes('youth spark')) return { text: 'Youth Spark National mewadahi pengetahuan dan minat bakat pemuda melalui Seminar & Webinar, Kompetisi, dan Pelatihan Pelatih.', suggestions: [{label:'Buka Youth Spark National',path:'/youth-spark'},{label:'Seminar & Webinar',path:'/youth-spark/seminar-webinar'}] };
  if (hit) return { text: `Saya arahkan kamu ke ${hit.label}.`, suggestions: [{label:`Buka ${hit.label}`,path:hit.path}] };
  return { text:'Saya bisa membantu mengarahkan kamu ke tab yang tepat. Coba tanyakan tentang KC, YOUTH SPARK, pendidikan, struktur, Mako, atau administrasi.', suggestions: DESTINATIONS.slice(0,5).map(d=>({label:d.label,path:d.path})) };
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const message = String(req.body?.message || '').trim();
  if (!message) return res.status(400).json({ error: 'Message required' });
  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(200).json(fallback(message));

  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const system = `Kamu adalah Asisten Menwa UNJ untuk navigasi website. Jawab singkat dalam Bahasa Indonesia, ramah, faktual, dan jangan mengarang. Tugas utama: memahami pertanyaan pengunjung lalu mengarahkan mereka ke tab/subtab website. Destinasi: ${JSON.stringify(DESTINATIONS)}. Data Youth Spark National: Pembinaan Aktivitas Pemuda; Youth Spark National Seminar bertema Empowering Youth, Elevating UMKM, tanggal 24 Oktober 2026, Aula Latief Hendraningrat Universitas Negeri Jakarta, rundown 08.00–12.00 WIB, narasumber Dr. Tomi Ari Sudewo (Kepemudaan), Dr. Ir. Achmad Fachrodji (Industri Kreatif), Deputi Bidang Kewirausahaan (UMKM Naik Kelas), pendaftaran https://forms.gle/Xc3QsBLNueoXYLfDA. KC VIII 05–08 November 2026, pendaftaran Rp2.000.000/tim, jersey peserta ATHLETE gratis dengan form https://forms.gle/voyPEgvxvhS8VrKf8, jersey official Rp150.000 dengan form https://forms.gle/RHoXRFTEVKWHQfFx9. Jika pertanyaan cocok dengan destinasi, selalu berikan suggestions berisi 1-2 tombol navigasi. Balas JSON valid: {"text":"...","suggestions":[{"label":"...","path":"/..."}]}`;
  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`, {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ systemInstruction:{parts:[{text:system}]}, contents:[{role:'user',parts:[{text:message}]}], generationConfig:{temperature:0.2,responseMimeType:'application/json'} })
    });
    if (!r.ok) throw new Error('Gemini error');
    const data = await r.json();
    const raw = data?.candidates?.[0]?.content?.parts?.map(p=>p.text||'').join('') || '';
    const parsed = JSON.parse(raw.replace(/^```json\s*|\s*```$/g,''));
    return res.status(200).json(parsed);
  } catch (e) { return res.status(200).json(fallback(message)); }
}
