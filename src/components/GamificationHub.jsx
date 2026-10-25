import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Sparkles, 
  Flame, 
  ShieldCheck, 
  Award, 
  Gift, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle, 
  Users, 
  ChevronRight, 
  RotateCcw,
  Star,
  Lock,
  Clock
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.jsx';
import { getLeaderboardUsers } from '../firebase.js';

const TACTICAL_QUESTIONS = [
  {
    id: 1,
    question: 'Berapa kompas azimuth yang saling berlawanan tepat 180 derajat (back azimuth) dari sudut 45 derajat?',
    options: ['135 derajat', '225 derajat', '315 derajat', '180 derajat'],
    correct: 1,
    tip: 'Jika azimuth kurang dari 180 derajat, tambahkan 180 (45 + 180 = 225 derajat).'
  },
  {
    id: 2,
    question: 'Semboyan resmi Korps Resimen Mahasiswa Indonesia adalah:',
    options: ['Widya Castrena Dharma Siddha', 'Bhinneka Tunggal Ika', 'Satya Lencana Wiratama', 'Dharma Puspa Pertiwi'],
    correct: 0,
    tip: 'Widya Castrena Dharma Siddha bermakna "Penyempurnaan Pengabdian dengan Ilmu Pengetahuan dan Olah Keprajuritan".'
  },
  {
    id: 3,
    question: 'Dalam pertolongan pertama lapangan (P3K), prinsip dasar penanganan cedera terkilir RICE adalah:',
    options: [
      'Rest, Ice, Compression, Elevation',
      'Run, Inspect, Care, Evacuate',
      'Rehydrate, Immobilize, Check, Exercise',
      'Relief, Inject, Clean, Examine'
    ],
    correct: 0,
    tip: 'RICE (Rest, Ice, Compression, Elevation) adalah protokol baku meminimalisasi pembengkakan jaringan lunak.'
  },
  {
    id: 4,
    question: 'Warna baret resmi satuan Resimen Mahasiswa Jayakarta adalah:',
    options: ['Ungu / Magenta', 'Cokelat Baret', 'Hijau Rimba', 'Biru Muda'],
    correct: 0,
    tip: 'Baret Ungu merupakan simbol kebanggaan dan identitas Resimen Mahasiswa se-Indonesia.'
  }
];

const REWARDS = [
  {
    id: 'r1',
    name: 'Pin Korps Logam Menwa UNJ Emas',
    points: 350,
    category: 'Merchandise',
    desc: 'Lencana pin logam edisi resmi dengan lapisan enamel emas tahan karat.'
  },
  {
    id: 'r2',
    name: 'Baret Menwa Koleksi Satuan',
    points: 750,
    category: 'Atribut',
    desc: 'Baret ungu kualitas standar dinas dengan emblem logam Jayakarta.'
  },
  {
    id: 'r3',
    name: 'Tumbler Taktis Stainless Steel',
    points: 500,
    category: 'Lifestyle',
    desc: 'Botol vakum tahan suhu panas/dingin 24 jam dengan grafir laser Menwa UNJ.'
  },
  {
    id: 'r4',
    name: 'Rompi Taktis Lapangan Menwa',
    points: 1200,
    category: 'Perlengkapan',
    desc: 'Rompi multi-saku berbahan Cordura tahan gesekan untuk latihan lapangan.'
  }
];

export function GamificationHub({ onOpenAuth }) {
  const { user, profile, earnPoints, isVerifiedMenwa } = useAuth();

  const [activeTab, setActiveTab] = useState('quiz'); // 'quiz' | 'leaderboard' | 'rewards'
  const [leaderboardTab, setLeaderboardTab] = useState('menwa'); // 'menwa' | 'global'
  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  // Quiz Game State
  const todayStr = new Date().toISOString().split('T')[0];
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizFinished, setQuizFinished] = useState(false);
  const [earnedScore, setEarnedScore] = useState(0);

  // Cek apakah sudah menyelesaikan kuis hari ini
  const alreadyDoneToday = profile?.lastQuizDate === todayStr;

  useEffect(() => {
    loadLeaderboardData();
  }, []);

  const loadLeaderboardData = async () => {
    setLoadingLeaderboard(true);
    try {
      const data = await getLeaderboardUsers();
      setLeaderboard(data);
    } catch (e) {
      console.error('Gagal muat leaderboard:', e);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  const handleSelectOption = (optIdx) => {
    if (selectedAnswers[currentQIdx] !== undefined) return;
    setSelectedAnswers(prev => ({ ...prev, [currentQIdx]: optIdx }));
  };

  const handleNextQuestion = () => {
    if (currentQIdx < TACTICAL_QUESTIONS.length - 1) {
      setCurrentQIdx(prev => prev + 1);
    } else {
      // Hitung total skor
      let correctCount = 0;
      TACTICAL_QUESTIONS.forEach((q, idx) => {
        if (selectedAnswers[idx] === q.correct) {
          correctCount++;
        }
      });
      const points = correctCount * 30 + 10; // maks 130 poin
      setEarnedScore(points);
      setQuizFinished(true);

      if (user && earnPoints) {
        earnPoints(points, todayStr);
        loadLeaderboardData();
      }
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQIdx(0);
    setSelectedAnswers({});
    setQuizFinished(false);
    setEarnedScore(0);
  };

  // Filter leaderboard
  const verifiedMenwaList = leaderboard.filter(u => u.isVerifiedMenwa);
  const displayedLeaderboard = leaderboardTab === 'menwa' ? verifiedMenwaList : leaderboard;

  return (
    <div className="space-y-6">
      {/* Gamification Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gamifikasi Taktis Menwa UNJ</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Pusat Latihan Asah Otak & Poin Taktis
            </h2>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              Tingkatkan pengetahuan keprajuritan, kepemimpinan, dan wawasan kebangsaan melalui kuis harian, raih peringkat teratas, dan kumpulkan poin hadiah.
            </p>
          </div>

          {/* User Score Card */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 min-w-[240px] flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-slate-400">Total Poin Taktis Anda</p>
              <div className="flex items-center gap-2 mt-1">
                <Flame className="w-5 h-5 text-amber-400 fill-amber-400" />
                <span className="text-2xl font-black font-mono text-amber-400 tabular-nums">
                  {profile?.tacticalPoints || 0}
                </span>
                <span className="text-xs text-slate-400 font-medium">EXP</span>
              </div>
            </div>

            {user ? (
              isVerifiedMenwa ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold" title="Anggota Menwa Terverifikasi Resmi">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verified Menwa</span>
                </div>
              ) : (
                <div className="text-right">
                  <span className="text-[11px] text-slate-500 block">Status Anggota</span>
                  <span className="text-xs text-slate-300 font-medium">Peserta Global</span>
                </div>
              )
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg transition-colors"
              >
                Masuk Akun
              </button>
            )}
          </div>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-6 border-t border-slate-800/80">
          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'quiz' 
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold' 
                : 'bg-slate-950/60 text-slate-400 hover:text-white'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Kuis Taktis Harian</span>
          </button>
          
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'leaderboard' 
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold' 
                : 'bg-slate-950/60 text-slate-400 hover:text-white'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Papan Peringkat (Leaderboard)</span>
          </button>

          <button
            onClick={() => setActiveTab('rewards')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'rewards' 
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold' 
                : 'bg-slate-950/60 text-slate-400 hover:text-white'
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>Tukar Hadiah</span>
            <span className="text-[10px] bg-red-600/30 text-red-300 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
              Coming Soon
            </span>
          </button>
        </div>
      </div>

      {/* TAB 1: KUIS TAKTIS HARIAN */}
      {activeTab === 'quiz' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 text-white shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                Daily Brain Drill · Duolingo Style
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
                Asah Otak & Wawasan Keprajuritan
              </h3>
            </div>
            {!quizFinished && (
              <div className="text-xs font-mono text-slate-400">
                Soal {currentQIdx + 1} / {TACTICAL_QUESTIONS.length}
              </div>
            )}
          </div>

          {alreadyDoneToday && !quizFinished && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-center justify-between gap-4 text-emerald-300 text-xs sm:text-sm">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Anda telah menyelesaikan kuis taktis hari ini! Anda tetap bisa berlatih tanpa batas poin.</span>
              </div>
              <button
                onClick={handleRestartQuiz}
                className="px-3 py-1.5 bg-emerald-600/30 hover:bg-emerald-600/50 text-white rounded-lg text-xs font-semibold shrink-0 transition-colors"
              >
                Ulangi Latihan
              </button>
            </div>
          )}

          {!quizFinished ? (
            <div className="space-y-6">
              {/* Question Statement */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 sm:p-6">
                <p className="text-base sm:text-lg font-semibold text-white leading-relaxed">
                  {TACTICAL_QUESTIONS[currentQIdx].question}
                </p>
              </div>

              {/* Multiple Choice Options */}
              <div className="space-y-3">
                {TACTICAL_QUESTIONS[currentQIdx].options.map((opt, optIdx) => {
                  const isSelected = selectedAnswers[currentQIdx] === optIdx;
                  const hasAnswered = selectedAnswers[currentQIdx] !== undefined;
                  const isCorrect = optIdx === TACTICAL_QUESTIONS[currentQIdx].correct;

                  let btnStyle = 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-200';
                  if (hasAnswered) {
                    if (isCorrect) {
                      btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500/50';
                    } else if (isSelected && !isCorrect) {
                      btnStyle = 'bg-red-500/20 border-red-500 text-red-200';
                    }
                  } else if (isSelected) {
                    btnStyle = 'bg-amber-500/20 border-amber-500 text-amber-200';
                  }

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectOption(optIdx)}
                      disabled={hasAnswered}
                      className={`w-full text-left p-4 rounded-xl border text-sm font-medium transition-all flex items-center justify-between ${btnStyle}`}
                    >
                      <span>{opt}</span>
                      {hasAnswered && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Tip / Feedback */}
              {selectedAnswers[currentQIdx] !== undefined && (
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-300">
                  <span className="font-semibold text-amber-400 mr-2">Catatan Taktis:</span>
                  <span>{TACTICAL_QUESTIONS[currentQIdx].tip}</span>
                </div>
              )}

              {/* Action Button */}
              <div className="flex justify-end pt-4">
                <button
                  onClick={handleNextQuestion}
                  disabled={selectedAnswers[currentQIdx] === undefined}
                  className="py-2.5 px-6 bg-gradient-to-r from-red-800 to-amber-700 hover:from-red-700 hover:to-amber-600 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-all shadow-md disabled:opacity-40"
                >
                  <span>{currentQIdx < TACTICAL_QUESTIONS.length - 1 ? 'Soal Berikutnya' : 'Selesaikan Kuis'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Quiz Completed Result */
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto text-amber-400">
                <Trophy className="w-8 h-8" />
              </div>
              <h4 className="text-2xl font-bold text-white">Kuis Harian Selesai!</h4>
              <p className="text-sm text-slate-300 max-w-md mx-auto">
                Luar biasa! Anda telah menyelesaikan latihan asah otak taktis hari ini dan memperoleh poin EXP.
              </p>

              <div className="inline-flex items-center gap-3 px-6 py-3 bg-slate-950 border border-amber-500/40 rounded-xl">
                <Flame className="w-6 h-6 text-amber-400 fill-amber-400" />
                <span className="text-2xl font-black font-mono text-amber-400">+{earnedScore}</span>
                <span className="text-xs text-slate-400 font-medium">Poin Taktis Diraih</span>
              </div>

              <div className="pt-4 flex items-center justify-center gap-4">
                <button
                  onClick={handleRestartQuiz}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Latihan Lagi</span>
                </button>
                <button
                  onClick={() => setActiveTab('leaderboard')}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition-colors flex items-center gap-2"
                >
                  <Trophy className="w-4 h-4" />
                  <span>Lihat Papan Peringkat</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PAPAN PERINGKAT (LEADERBOARD) */}
      {activeTab === 'leaderboard' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 text-white shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                Papan Kehormatan & Peringkat
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
                Peringkat Poin Taktis Menwa UNJ
              </h3>
            </div>

            {/* Segmented Filter Control */}
            <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-xl">
              <button
                onClick={() => setLeaderboardTab('menwa')}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                  leaderboardTab === 'menwa'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Anggota Menwa UNJ</span>
              </button>
              <button
                onClick={() => setLeaderboardTab('global')}
                className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                  leaderboardTab === 'global'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Ranking Global</span>
              </button>
            </div>
          </div>

          {loadingLeaderboard ? (
            <div className="text-center py-12 text-slate-400 text-xs font-mono">
              Memuat data papan peringkat...
            </div>
          ) : displayedLeaderboard.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              Belum ada peserta dalam kategori ini. Jadilah yang pertama mengumpulkan poin!
            </div>
          ) : (
            <div className="space-y-2.5">
              {displayedLeaderboard.map((item, idx) => {
                const isCurrentUser = user && item.uid === user.uid;
                let rankBadge = (
                  <span className="font-mono text-xs font-bold text-slate-400 w-6 text-center">
                    #{idx + 1}
                  </span>
                );

                if (idx === 0) {
                  rankBadge = <span className="text-amber-400 font-bold text-sm w-6 text-center">🥇</span>;
                } else if (idx === 1) {
                  rankBadge = <span className="text-slate-300 font-bold text-sm w-6 text-center">🥈</span>;
                } else if (idx === 2) {
                  rankBadge = <span className="text-amber-700 font-bold text-sm w-6 text-center">🥉</span>;
                }

                return (
                  <div
                    key={item.id || item.uid || idx}
                    className={`flex items-center justify-between p-3.5 sm:p-4 rounded-xl border transition-colors ${
                      isCurrentUser 
                        ? 'bg-amber-500/10 border-amber-500/40 ring-1 ring-amber-500/20' 
                        : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {rankBadge}
                      <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-amber-400 shrink-0">
                        {item.displayName ? item.displayName.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs sm:text-sm font-semibold text-white truncate">
                            {item.displayName || 'Anggota Pengguna'}
                          </span>
                          {item.isVerifiedMenwa && (
                            <span title="Anggota Menwa UNJ Resmi Terverifikasi">
                              <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                            </span>
                          )}
                          {isCurrentUser && (
                            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono">
                              Anda
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">
                          {item.institution || 'Universitas Negeri Jakarta'}
                          {item.menwaNia ? ` · NIA: ${item.menwaNia}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pl-3 shrink-0">
                      <Flame className="w-4 h-4 text-amber-400" />
                      <span className="font-mono text-sm sm:text-base font-bold text-amber-400 tabular-nums">
                        {item.tacticalPoints || 0}
                      </span>
                      <span className="text-[11px] text-slate-500 hidden sm:inline">EXP</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: KATALOG PENUKARAN HADIAH (COMING SOON) */}
      {activeTab === 'rewards' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 text-white shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                Penukaran Poin Taktis
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
                Katalog Hadiah Resmi Menwa UNJ
              </h3>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400 text-xs font-semibold">
              <Clock className="w-3.5 h-3.5" />
              <span>Status: Segera Hadir (Coming Soon)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {REWARDS.map(r => (
              <div 
                key={r.id} 
                className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 flex flex-col justify-between relative overflow-hidden"
              >
                <div className="absolute top-3 right-3">
                  <span className="text-[10px] bg-red-600/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded font-mono font-semibold uppercase">
                    Coming Soon
                  </span>
                </div>

                <div>
                  <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                    {r.category}
                  </span>
                  <h4 className="text-base font-bold text-white mt-1 mb-2">
                    {r.name}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    {r.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-amber-400">
                    <Flame className="w-3.5 h-3.5" />
                    <span>{r.points} Poin Taktis</span>
                  </div>

                  <button
                    disabled
                    className="px-3 py-1.5 bg-slate-800/80 text-slate-500 text-xs font-medium rounded-lg cursor-not-allowed flex items-center gap-1.5"
                  >
                    <Lock className="w-3 h-3" />
                    <span>Nantikan Rilis</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default GamificationHub;
