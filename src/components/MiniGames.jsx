import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Sparkles, 
  Flame, 
  ShieldCheck, 
  CheckCircle2, 
  HelpCircle, 
  ChevronRight, 
  RotateCcw,
  Calendar,
  Zap,
  Award,
  Volume2,
  VolumeX,
  Compass,
  Users,
  BookOpen,
  HeartPulse,
  Radio,
  Target
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.jsx';
import { TacticalConfetti } from './TacticalConfetti.jsx';

// 7 Tema Harian Terstruktur (0 = Minggu, 1 = Senin, ..., 6 = Sabtu)
export const DAILY_CHALLENGES = {
  1: {
    dayName: 'Senin',
    theme: 'Taktik & Navigasi Darat',
    desc: 'Uji kemampuan pembacaan peta topografi, perhitungan sudut kompas azimuth & back azimuth, dan penentuan posisi koordinat medan.',
    icon: Compass,
    bonusExp: 150,
    questions: [
      {
        q: 'Jika sudut kompas (azimuth) menuju sasaran terbaca 65°, berapa sudut kompas balik (back azimuth) yang tepat?',
        options: ['155°', '245°', '205°', '335°'],
        correct: 1,
        tip: 'Rumus baku back azimuth: Jika azimuth awal < 180°, tambahkan 180° (65° + 180° = 245°).'
      },
      {
        q: 'Garis kontur pada peta topografi yang semakin rapat menandakan kondisi medan yang...',
        options: ['Semakin terjal / curam', 'Semakin landai dan datar', 'Daerah rawa / berair', 'Vegetasi hutan lebat'],
        correct: 0,
        tip: 'Kerapatan kontur menunjukkan gradien ketinggian vertikal yang ekstrem per jarak horizontal (lereng curam).'
      },
      {
        q: 'Metode penentuan posisi koordinat diri sendiri di lapangan menggunakan dua titik acuan yang sudah dikenali di peta disebut...',
        options: ['Intersection', 'Resection', 'Dead Reckoning', 'Traversing'],
        correct: 1,
        tip: 'Resection menentukan posisi berdiri pengamat dengan membidik minimal 2 tanda medan yang ada di peta.'
      }
    ]
  },
  2: {
    dayName: 'Selasa',
    theme: 'Kepemimpinan Lapangan & Manajemen Regu',
    desc: 'Pengambilan keputusan taktis cepat, dinamika psikologi prajurit mahasiswa, dan pembagian peran regu lapangan.',
    icon: Users,
    bonusExp: 120,
    questions: [
      {
        q: 'Siklus cepat pengambilan keputusan taktis dalam kondisi darurat yang terdiri atas Observe, Orient, Decide, Act dikenal sebagai...',
        options: ['PDCA Cycle', 'OODA Loop', 'SWOT Matrix', 'Gantt Tactical'],
        correct: 1,
        tip: 'OODA Loop (John Boyd) adalah fondasi kecepatan adaptasi taktis komandan regu dalam pertempuran dan krisis.'
      },
      {
        q: 'Prinsip kepemimpinan Ki Hajar Dewantara yang menekankan keteladanan seorang instruktur di barisan paling depan adalah...',
        options: ['Ing Ngarso Sung Tulodo', 'Ing Madyo Mangun Karso', 'Tut Wuri Handayani', 'Satyaku Kudharmakan'],
        correct: 0,
        tip: 'Ing Ngarso Sung Tulodo: Di depan memberi teladan moral, kedisiplinan, dan ketegaran.'
      },
      {
        q: 'Tindakan awal komandan regu ketika mendapati anggotanya mengalami kepanikan saat simulasi operasi malam hari adalah...',
        options: [
          'Tarik ke zona aman, lakukan stabilisasi napas (Box Breathing), dan beri perintah terstruktur sederhana',
          'Tinggalkan personel di pos bayangan',
          'Berikan hukuman fisik di tempat'
        ],
        correct: 0,
        tip: 'Instruksi terstruktur pendek dan ritme napas stabil mengembalikan fungsi kognitif korteks prefrontal personel.'
      }
    ]
  },
  3: {
    dayName: 'Rabu',
    theme: 'Sejarah Perjuangan & Doktrin Menwa',
    desc: 'Pemahaman sejarah pembentukan Resimen Mahasiswa, doktrin pertahanan sipil, dan nilai luhur Widya Castrena Dharma Siddha.',
    icon: BookOpen,
    bonusExp: 130,
    questions: [
      {
        q: 'Semboyan agung Korps Resimen Mahasiswa Indonesia adalah "Widya Castrena Dharma Siddha", yang secara harfiah bermakna...',
        options: [
          'Penyempurnaan Pengabdian dengan Ilmu Pengetahuan dan Olah Keprajuritan',
          'Keberanian Tanpa Pamrih Demi Kejayaan Ibu Pertiwi',
          'Kecerdasan Moral dan Ketaatan Satya Komando',
          'Persatuan Intelektual untuk Pembangunan Bangsa'
        ],
        correct: 0,
        tip: 'Widya (Ilmu), Castrena (Senjata/Keprajuritan), Dharma (Pengabdian), Siddha (Penyempurnaan).'
      },
      {
        q: 'Cikal bakal pembentukan Batalyon Mahasiswa pertama di Indonesia lahir pada masa perjuangan mempertahankan kemerdekaan, yaitu...',
        options: ['Batalyon 131 Tentara Pelajar (TP)', 'Resimen Pelopor Brimob', 'Korps Sukarelawan PMI', 'Pasukan Komando Mandiri'],
        correct: 0,
        tip: 'Tentara Pelajar (TP) dan Batalyon Mahasiswa Dwikora 1962 adalah akar historis berdirinya Menwa Indonesia.'
      },
      {
        q: 'Warna baret kebanggaan korps Resimen Mahasiswa Jayakarta Satuan UNJ adalah...',
        options: ['Ungu / Magenta', 'Cokelat Baret', 'Hijau Rimba', 'Biru Tua'],
        correct: 0,
        tip: 'Baret Ungu melambangkan kemuliaan pengabdian intelektual bersanding dengan jiwa ksatria prajurit.'
      }
    ]
  },
  4: {
    dayName: 'Kamis',
    theme: 'P3K Lapangan & Survival',
    desc: 'Manajemen luka terbuka, penanganan hipotermia/heatstroke, prioritas triage, dan teknik navigasi survival rimba.',
    icon: HeartPulse,
    bonusExp: 140,
    questions: [
      {
        q: 'Dalam protokol pertolongan pertama pada cedera terkilir atau hematoma, metode RICE merupakan singkatan dari...',
        options: [
          'Rest, Ice, Compression, Elevation',
          'Run, Inspect, Care, Evacuate',
          'Rehydrate, Immobilize, Check, Exercise',
          'Recovery, Inject, Compress, Examine'
        ],
        correct: 0,
        tip: 'RICE mengendalikan respons peradangan akut dan meminimalkan pendarahan mikro di dalam jaringan lunak.'
      },
      {
        q: 'Prioritas tertinggi dalam aturan kelangsungan hidup rimba "Rule of Threes" (Aturan Angka Tiga) adalah...',
        options: [
          '3 menit tanpa udara / lingkungan aman',
          '3 jam tanpa perlindungan (shelter) di cuaca ekstrem',
          '3 hari tanpa asupan air minum',
          '3 minggu tanpa makanan padat'
        ],
        correct: 0,
        tip: 'Tubuh manusia hanya mampu bertahan ~3 menit tanpa oksigen/jalan napas bebas sebelum kerusakan otak permanen.'
      },
      {
        q: 'Tindakan mitigasi darurat saat rekan regu mengalami tanda awal serangan sengatan panas (heatstroke) adalah...',
        options: [
          'Evakuasi ke tempat teduh, basahi tubuh dengan air dingin, kompres area lipatan leher/ketiak, dan longgarkan pakaian',
          'Beri minuman berkafein atau berkarbonasi manis',
          'Bungkus dengan selimut tebal'
        ],
        correct: 0,
        tip: 'Heatstroke adalah darurat medis; penurunan suhu inti tubuh secara agresif wajib dilakukan segera.'
      }
    ]
  },
  5: {
    dayName: 'Jumat',
    theme: 'Peraturan Baris Berbaris (PBB) & Protokoler',
    desc: 'Ketepatan tempo baris-berbaris, hierarki aba-aba dinas, dan etika keprotokoleran upacara resmi sipil-militer.',
    icon: Target,
    bonusExp: 110,
    questions: [
      {
        q: 'Sesuai regulasi PBB baku, struktur aba-aba resmi terdiri atas tiga tingkatan urutan yaitu...',
        options: [
          'Aba-aba Petunjuk, Aba-aba Peringatan, Aba-aba Pelaksanaan',
          'Aba-aba Peringatan, Aba-aba Isyarat, Aba-aba Eksekusi',
          'Aba-aba Teguran, Aba-aba Seruan, Aba-aba Henti'
        ],
        correct: 0,
        tip: 'Struktur: Petunjuk (maksud gerakan) -> Peringatan (kesiapan) -> Pelaksanaan (saat eksekusi: GERAK/JALAN/MULAI).'
      },
      {
        q: 'Tempo langkah tegap dalam baris-berbaris resmi satuan adalah...',
        options: ['120 langkah per menit', '90 langkah per menit', '140 langkah per menit', '60 langkah per menit'],
        correct: 0,
        tip: 'Tempo baku defile dan langkah tegap adalah 120 tempo per menit dengan ayunan lengan 90 derajat ke depan.'
      },
      {
        q: 'Saat upacara resmi di lapangan terbuka, posisi bendera Merah Putih terhadap bendera korps/organisasi lainnya adalah...',
        options: [
          'Selalu berada di sebelah kanan kehormatan (kanan inspektur upacara) atau di tengah lebih tinggi',
          'Selalu di sebelah kiri paling belakang',
          'Sejajar tanpa pembeda posisi'
        ],
        correct: 0,
        tip: 'Sesuai UU No. 24 Tahun 2009, Bendera Negara ditempatkan di sebelah kanan kehormatan atau posisi sentral tertinggi.'
      }
    ]
  },
  6: {
    dayName: 'Sabtu',
    theme: 'Komunikasi Taktis, Semboyan & Sandi',
    desc: 'Alfabet fonetik NATO/ICAO, sandi Morse, isyarat tangan patroli senyap, dan prosedur radio komunikasi lapangan.',
    icon: Radio,
    bonusExp: 135,
    questions: [
      {
        q: 'Pelafalan fonetik militer internasional (NATO Phonetic Alphabet) untuk huruf M, E, N, W, A adalah...',
        options: [
          'Mike, Echo, November, Whiskey, Alfa',
          'Metro, Easy, Nancy, William, Able',
          'Mark, Eagle, Nation, Water, Apple'
        ],
        correct: 0,
        tip: 'M-E-N-W-A = Mike - Echo - November - Whiskey - Alfa menjamin nihil salah dengar di frekuensi radio bising.'
      },
      {
        q: 'Dalam kode sandi Morse internasional, isyarat darurat bahaya internasional SOS dituliskan sebagai...',
        options: [
          '· · · — — — · · · (3 titik, 3 garis, 3 titik)',
          '— — — · · · — — — (3 garis, 3 titik, 3 garis)',
          '· — · — · —'
        ],
        correct: 0,
        tip: 'S (···), O (———), S (···) adalah sinyal distres universal tanpa jeda antar huruf.'
      },
      {
        q: 'Saat patroli senyap di malam hari, isyarat telapak tangan terbuka diangkat setinggi bahu menghadap ke depan bermakna...',
        options: ['Berhenti seketika (Freeze / Halt)', 'Maju cepat (Charge)', 'Bubar barisan', 'Buka tembakan'],
        correct: 0,
        tip: 'Telapak tangan terbuka menghadap depan adalah aba-aba non-verbal henti total tanpa suara.'
      }
    ]
  },
  0: {
    dayName: 'Minggu',
    theme: 'Ujian Komando & Skenario Gabungan',
    desc: 'Simulasi komprehensif integrasi navigasi, kepemimpinan krisis, pertolongan darurat, dan koordinasi pertahanan pangkalan.',
    icon: Zap,
    bonusExp: 200,
    questions: [
      {
        q: 'Dalam skenario darurat ketika komunikasi radio terputus dan kabut tebal menutupi medan, prinsip komando pertama adalah...',
        options: [
          'Kumpul di titik kumpul darurat (Rally Point) yang telah ditetapkan pada briefing pra-operasi',
          'Setiap prajurit bergerak mandiri mencari pemukiman',
          'Menyalakan flare api secara acak'
        ],
        correct: 0,
        tip: 'Rally Point yang disepakati sebelumnya adalah jangkar keselamatan regu saat situasi kabur atau disorientasi.'
      },
      {
        q: 'Sikap mental prajurit Resimen Mahasiswa saat menghadapi tantangan beruntun tanpa jeda istirahat dilandasi oleh...',
        options: [
          'Resiliensi mental, disiplin loyalitas, dan tanggung jawab kehormatan satuan',
          'Keluhan emosional terbuka',
          'Menyerahkan tugas sepenuhnya kepada orang lain'
        ],
        correct: 0,
        tip: 'Integritas dan ketahanan mental terbentuk melalui tempaan kedisiplinan dan soliditas korps.'
      },
      {
        q: 'Berapa poin EXP maksimum yang bisa diraih prajurit pada sesi tantangan komando hari Minggu ini?',
        options: ['Hingga +200 EXP', '50 EXP', '30 EXP'],
        correct: 0,
        tip: 'Tantangan hari Minggu memiliki multiplier EXP bonus tertinggi sebagai apresiasi ketuntasan mingguan!'
      }
    ]
  }
};

export function MiniGames({ onOpenAuth, onOpenLeaderboard }) {
  const { user, profile, earnPoints } = useAuth();

  // Dapatkan hari dalam minggu (0 = Minggu, 1 = Senin, dst)
  const currentDayOfWeek = new Date().getDay();
  const todayChallenge = DAILY_CHALLENGES[currentDayOfWeek] || DAILY_CHALLENGES[1];
  const todayStr = new Date().toISOString().split('T')[0];

  const [gameState, setGameState] = useState('MENU'); // 'MENU' | 'PLAYING' | 'RESULT'
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [earnedExp, setEarnedExp] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Audio synthesizer via Web Audio API (ringan, tanpa file external)
  const playChime = (type = 'success') => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'success') {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === 'error') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.setValueAtTime(164.81, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'victory') {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2);
        osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
      }
    } catch {
      // AudioContext error suppressed
    }
  };

  const isCompletedToday = profile?.lastQuizDate === todayStr;
  const IconComponent = todayChallenge.icon;
  const totalQuestions = todayChallenge.questions.length;
  const currentQ = todayChallenge.questions[currentQIndex];

  const handleStartGame = () => {
    setGameState('PLAYING');
    setCurrentQIndex(0);
    setSelectedAnswer(null);
    setIsAnswerSubmitted(false);
    setCorrectAnswersCount(0);
    setEarnedExp(0);
  };

  const handleSelectAnswer = (idx) => {
    if (isAnswerSubmitted) return;
    setSelectedAnswer(idx);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || isAnswerSubmitted) return;
    setIsAnswerSubmitted(true);

    const isCorrect = selectedAnswer === currentQ.correct;
    if (isCorrect) {
      playChime('success');
      setCorrectAnswersCount(prev => prev + 1);
    } else {
      playChime('error');
    }
  };

  const handleNextQuestion = () => {
    if (currentQIndex < totalQuestions - 1) {
      setCurrentQIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswerSubmitted(false);
    } else {
      // Selesaikan game
      const finalCorrect = correctAnswersCount + (selectedAnswer === currentQ.correct ? 1 : 0);
      const points = Math.round((finalCorrect / totalQuestions) * todayChallenge.bonusExp);
      setEarnedExp(points);
      setGameState('RESULT');
      playChime('victory');

      if (user && earnPoints && points > 0) {
        earnPoints(points, todayStr);
      }
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden">
      {/* Decorative tactical ambient glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top HUD Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <IconComponent className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                Tantangan {todayChallenge.dayName}
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs font-semibold text-slate-300">Menwa Tactics Daily</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white mt-0.5">
              {todayChallenge.theme}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
            title={soundEnabled ? 'Matikan Suara FX' : 'Aktifkan Suara FX'}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800">
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="font-mono text-sm font-bold text-amber-400 tabular-nums">
              {profile?.tacticalPoints || 0}
            </span>
            <span className="text-[10px] text-slate-400 uppercase font-semibold">EXP</span>
          </div>
        </div>
      </div>

      {/* KONDISI 1: MENU UTAMA */}
      {gameState === 'MENU' && (
        <div className="relative z-10 py-8 space-y-6">
          <div className="max-w-2xl">
            <p className="text-slate-300 text-sm leading-relaxed">
              {todayChallenge.desc}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Target size={14} className="text-amber-400" /> {totalQuestions} Soal Taktis
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <Zap size={14} className="text-emerald-400" /> Bonus Hari Ini: Hingga +{todayChallenge.bonusExp} EXP
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <Calendar size={14} className="text-sky-400" /> Berganti Otomatis Setiap 00.00 WIB
              </span>
            </div>
          </div>

          {/* Status Kuis Hari Ini */}
          {isCompletedToday ? (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-4 text-emerald-300 text-xs sm:text-sm">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                <span>Prajurit! Anda telah menyelesaikan kuis taktis hari ini. Anda tetap dapat berlatih dalam mode simulasi.</span>
              </div>
              <button
                onClick={handleStartGame}
                className="px-4 py-2 bg-emerald-600/30 hover:bg-emerald-600/50 text-white font-bold rounded-xl text-xs transition shrink-0"
              >
                Latihan Simulasi
              </button>
            </div>
          ) : (
            <div className="pt-2">
              <button
                onClick={handleStartGame}
                className="py-3.5 px-8 bg-gradient-to-r from-red-800 to-amber-700 hover:from-red-700 hover:to-amber-600 text-white font-extrabold text-sm uppercase tracking-wider rounded-2xl shadow-xl transition-all hover:scale-105 flex items-center gap-2"
              >
                <Zap size={16} className="text-amber-300" />
                <span>Mulai Tantangan Taktis ({todayChallenge.dayName})</span>
              </button>
            </div>
          )}

          {/* Preview Jadwal 7 Hari */}
          <div className="pt-6 border-t border-slate-800">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
              Jadwal Rotasi 7 Tema Mingguan:
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
              {[1, 2, 3, 4, 5, 6, 0].map(dayIdx => {
                const dayData = DAILY_CHALLENGES[dayIdx];
                const isToday = currentDayOfWeek === dayIdx;
                return (
                  <div 
                    key={dayIdx} 
                    className={`p-3 rounded-xl border text-center transition ${
                      isToday 
                        ? 'bg-amber-500/20 border-amber-500/60 ring-1 ring-amber-500/30' 
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-400'
                    }`}
                  >
                    <span className={`text-[10px] font-black uppercase block ${isToday ? 'text-amber-400' : 'text-slate-500'}`}>
                      {dayData.dayName} {isToday && '(Hari Ini)'}
                    </span>
                    <span className="text-[11px] font-bold text-white block mt-1 truncate" title={dayData.theme}>
                      {dayData.theme.split(' ')[0]}
                    </span>
                    <span className="text-[10px] text-amber-400/80 font-mono mt-0.5 block">
                      +{dayData.bonusExp}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* KONDISI 2: SEDANG BERMAIN (PLAYING) */}
      {gameState === 'PLAYING' && (
        <div className="relative z-10 py-6 space-y-6">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-2">
            <span>Soal {currentQIndex + 1} dari {totalQuestions}</span>
            <span className="font-mono text-emerald-400">Nilai: {correctAnswersCount} Benar</span>
          </div>

          {/* Question Text */}
          <div className="p-5 sm:p-6 bg-slate-950/80 border border-slate-800 rounded-2xl">
            <h4 className="text-base sm:text-lg font-bold text-white leading-relaxed">
              {currentQ.q}
            </h4>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQ.options.map((opt, optIdx) => {
              const isSelected = selectedAnswer === optIdx;
              const isCorrect = optIdx === currentQ.correct;

              let btnClass = 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-200';
              if (isAnswerSubmitted) {
                if (isCorrect) {
                  btnClass = 'bg-emerald-500/20 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500/50';
                } else if (isSelected && !isCorrect) {
                  btnClass = 'bg-red-500/20 border-red-500 text-red-200';
                }
              } else if (isSelected) {
                btnClass = 'bg-amber-500/20 border-amber-500 text-amber-200 ring-1 ring-amber-500/30';
              }

              return (
                <button
                  key={optIdx}
                  onClick={() => handleSelectAnswer(optIdx)}
                  disabled={isAnswerSubmitted}
                  className={`w-full text-left p-4 rounded-xl border text-xs sm:text-sm font-semibold transition flex items-center justify-between ${btnClass}`}
                >
                  <span>{opt}</span>
                  {isAnswerSubmitted && isCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Tactical Tip on submit */}
          {isAnswerSubmitted && (
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300">
              <span className="font-bold text-amber-400 mr-2">Catatan Taktis Komando:</span>
              <span>{currentQ.tip}</span>
            </div>
          )}

          {/* Action button */}
          <div className="flex justify-between items-center pt-4 border-t border-slate-800">
            <button
              onClick={() => setGameState('MENU')}
              className="text-xs text-slate-400 hover:text-white transition"
            >
              Kembali ke Menu
            </button>

            {!isAnswerSubmitted ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={selectedAnswer === null}
                className="py-2.5 px-6 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition disabled:opacity-40"
              >
                Kunci Jawaban
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="py-2.5 px-6 bg-gradient-to-r from-red-800 to-amber-700 hover:from-red-700 hover:to-amber-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-1.5 shadow-md"
              >
                <span>{currentQIndex < totalQuestions - 1 ? 'Soal Selanjutnya' : 'Lihat Hasil Akhir'}</span>
                <ChevronRight size={15} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* KONDISI 3: HASIL KUIS (RESULT) */}
      {gameState === 'RESULT' && (
        <div className="relative z-10 py-8 text-center space-y-6">
          <TacticalConfetti trigger={true} />
          <div className="w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 shadow-xl">
            <Trophy size={40} />
          </div>

          <div>
            <span className="text-xs font-black uppercase tracking-widest text-amber-400">
              Tantangan {todayChallenge.dayName} Tuntas
            </span>
            <h4 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              {correctAnswersCount === totalQuestions ? 'Luar Biasa, Nilai Sempurna!' : 'Latihan Selesai, Prajurit!'}
            </h4>
            <p className="text-sm text-slate-300 mt-2 max-w-md mx-auto">
              Anda menjawab {correctAnswersCount} dari {totalQuestions} pertanyaan taktis dengan tepat.
            </p>
          </div>

          <div className="inline-flex items-center gap-3 px-8 py-4 bg-slate-950 border border-amber-500/40 rounded-2xl shadow-xl">
            <Flame className="w-7 h-7 text-amber-400 fill-amber-400 animate-bounce" />
            <div className="text-left">
              <span className="text-[11px] text-slate-400 uppercase font-bold block">Poin Taktis Diraih</span>
              <span className="text-2xl font-black font-mono text-amber-400">+{earnedExp} EXP</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => setGameState('MENU')}
              className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition"
            >
              Kembali ke Menu
            </button>
            {onOpenLeaderboard && (
              <button
                onClick={onOpenLeaderboard}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-1.5 shadow-lg"
              >
                <Trophy size={15} />
                <span>Lihat Papan Peringkat</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default MiniGames;
