import React, { useState } from 'react';
import { 
  Award, 
  BookOpen, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  Play, 
  ShieldCheck, 
  Sparkles, 
  Clock, 
  FileCheck, 
  Download, 
  AlertCircle,
  HelpCircle,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.jsx';
import { CertificateViewerModal } from './CertificateViewerModal.jsx';

const MODULES = [
  {
    id: 1,
    title: 'Modul 1: Dasar Kepemimpinan Taktis & Karakter Resimen',
    duration: '25 Menit',
    overview: 'Membangun fondasi kepemimpinan berwibawa, pemahaman psikologi kelompok, dan etika dasar instruktur bela negara.',
    sections: [
      {
        subtitle: '1. Filosofi Kepemimpinan Lapangan',
        content: 'Seorang pelatih Menwa bukan sekadar pemberi instruksi, melainkan role model moral dan mental. Tiga pilar utama instruktur adalah Keteladanan (Ing Ngarso Sung Tulodo), Kebersamaan Lapangan (Ing Madyo Mangun Karso), dan Pemberdayaan Potensi (Tut Wuri Handayani).'
      },
      {
        subtitle: '2. Komunikasi Instruksional yang Berwibawa',
        content: 'Dalam lingkungan lapangan yang bising atau bertekanan, intonasi, kejelasan diksi, dan bahasa tubuh tegap menentukan 80% efektivitas penerimaan pesan. Gunakan metode "Pemberitahuan - Petunjuk - Pelaksanaan" secara konsisten.'
      }
    ],
    quiz: {
      question: 'Apa rumus tiga tahap standar dalam menyampaikan aba-aba dan instruksi taktis lapangan?',
      options: [
        'Aba-aba Peringatan, Aba-aba Petunjuk, Aba-aba Pelaksanaan',
        'Aba-aba Langsung, Aba-aba Pengulangan, Aba-aba Penegasan',
        'Aba-aba Teguran, Aba-aba Larangan, Aba-aba Selesai'
      ],
      correctIndex: 0,
      explanation: 'Sesuai regulasi PBB baku, aba-aba terdiri atas Aba-aba Peringatan (menarik perhatian), Aba-aba Petunjuk (maksud gerakan), dan Aba-aba Pelaksanaan (waktu eksekusi).'
    }
  },
  {
    id: 2,
    title: 'Modul 2: Metodologi Pengajaran & Instruksi Lapangan',
    duration: '35 Menit',
    overview: 'Teknik drill baris-berbaris (PBB), manajemen risiko latihan fisik, dan adaptasi metode pelatihan peserta pemula.',
    sections: [
      {
        subtitle: '1. Metode Pengajaran Bertahap (Part-to-Whole)',
        content: 'Dalam melatih gerakan kompleks, jangan langsung mengajarkan seluruh rangkaian. Pecah menjadi hitungan bagian (misal: langkah tegap dari sikap sempurna -> ayunan tangan -> ayunan kaki berpadu) sebelum menggabungkannya dalam tempo utuh.'
      },
      {
        subtitle: '2. Manajemen Keselamatan & Hidrasi',
        content: 'Pelatih bertanggung jawab penuh atas keselamatan peserta. Wajib memeriksa riwayat medis awal, mengenali gejala awal heat exhaustion (kulit pucat, pusing, disorientasi), dan menetapkan jeda hidrasi terstruktur setiap 30-45 menit latihan terik.'
      }
    ],
    quiz: {
      question: 'Tindakan awal apa yang paling krusial ketika peserta menunjukkan gejala awal kelelahan panas (heat exhaustion)?',
      options: [
        'Pindahkan ke tempat teduh berangin, longgarkan pakaian dinas, dan berikan air minum sejuk bertahap',
        'Paksa peserta berdiri agar tidak pingsan di lapangan terbuka',
        'Siram seluruh tubuh dengan air es seketika'
      ],
      correctIndex: 0,
      explanation: 'Menurunkan suhu tubuh secara aman dengan memindahkan ke tempat teduh dan rehidrasi bertahap adalah SOP mitigasi heat exhaustion.'
    }
  },
  {
    id: 3,
    title: 'Modul 3: Manajemen Keprotokoleran & Penanganan Krisis',
    duration: '30 Menit',
    overview: 'Tata upacara kemiliteran sipil, etiket penyambutan pejabat, dan pengambilan keputusan cepat saat kondisi darurat.',
    sections: [
      {
        subtitle: '1. Tata Upacara & Garis Formasi',
        content: 'Memahami hierarki posisi inspektur upacara, komandan upacara, perwira upacara, dan barisan defile. Setiap aba-aba harus sinkron dengan protokol instansi dan tata tempat tamu kehormatan.'
      },
      {
        subtitle: '2. Pengambilan Keputusan Taktis (OODA Loop)',
        content: 'Saat terjadi anomali (hujan lebat mendadak, perubahan kedatangan tamu, insiden teknis tiang bendera), instruktur menerapkan siklus OODA: Observe (Amati), Orient (Petakan opsi), Decide (Tentukan rute mitigasi), Act (Eksekusi dengan tenang tanpa kepanikan).'
      }
    ],
    quiz: {
      question: 'Prinsip utama apa yang harus dipegang pelatih saat menghadapi kendala teknis upacara di hadapan audiens luas?',
      options: [
        'Ketenangan emosional, komunikasi kode radio/isyarat terkoordinasi, dan eksekusi rencana cadangan',
        'Menghentikan upacara dan memarahi petugas pelaksana secara langsung',
        'Meninggalkan mimbar protokol'
      ],
      correctIndex: 0,
      explanation: 'Pelatih protokol profesional selalu menjaga ketenangan komando dan mengeksekusi rencana cadangan terukur.'
    }
  }
];

export function YouthSparkTraining() {
  const { user, profile, awardCertificate, certificates, refreshCertificates } = useAuth();
  
  const [activeModuleIdx, setActiveModuleIdx] = useState(0);
  const [completedModules, setCompletedModules] = useState([false, false, false]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState({});
  const [activeCertificate, setActiveCertificate] = useState(null);
  const [isGeneratingCert, setIsGeneratingCert] = useState(false);

  const currentMod = MODULES[activeModuleIdx];
  const allCompleted = completedModules.every(Boolean);

  // Cek apakah user sudah memiliki sertifikat kursus ini
  const existingCert = certificates?.find(c => c.courseId === 'train_the_trainer_2026');

  const handleSelectAnswer = (optIdx) => {
    if (quizSubmitted[activeModuleIdx]) return;
    setSelectedAnswers(prev => ({ ...prev, [activeModuleIdx]: optIdx }));
  };

  const handleVerifyQuiz = () => {
    const chosen = selectedAnswers[activeModuleIdx];
    if (chosen === undefined) return;
    
    setQuizSubmitted(prev => ({ ...prev, [activeModuleIdx]: true }));
    if (chosen === currentMod.quiz.correctIndex) {
      setCompletedModules(prev => {
        const next = [...prev];
        next[activeModuleIdx] = true;
        return next;
      });
    }
  };

  const handleRetryQuiz = () => {
    setSelectedAnswers(prev => ({ ...prev, [activeModuleIdx]: undefined }));
    setQuizSubmitted(prev => ({ ...prev, [activeModuleIdx]: false }));
  };

  const handleClaimCertificate = async () => {
    if (!user) {
      alert('Silakan masuk ke akun Anda terlebih dahulu untuk menyimpan sertifikat resmi.');
      return;
    }
    setIsGeneratingCert(true);
    try {
      const recipientName = profile?.displayName || user.displayName || 'Peserta Pelatihan Pelatih';
      const certData = {
        courseId: 'train_the_trainer_2026',
        courseTitle: 'Pelatihan Pelatih (Train the Trainer) - Korps Instruktur Youth Spark',
        recipientName,
        recipientEmail: user.email || '',
        grade: 'Unggul (Distinction)',
        issuedAt: new Date().toISOString()
      };
      const saved = await awardCertificate(certData);
      setActiveCertificate(saved);
      if (refreshCertificates) refreshCertificates();
    } catch (e) {
      console.error('Gagal klaim sertifikat:', e);
      alert('Gagal menerbitkan sertifikat. Coba beberapa saat lagi.');
    } finally {
      setIsGeneratingCert(false);
    }
  };

  const progressPercent = Math.round((completedModules.filter(Boolean).length / MODULES.length) * 100);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Youth Spark E-Learning Academy</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Program Kerja: Pelatihan Pelatih (Train the Trainer)
            </h2>
            <p className="text-slate-300 text-sm mt-2 leading-relaxed">
              Program pelatihan instruktur terstandarisasi Coursera & DQLab style untuk mencetak pelatih lapangan berwibawa, cakap metodologi PBB, dan tersertifikasi resmi oleh Menwa UNJ.
            </p>
          </div>

          {/* Progress & Certificate Quick Action */}
          <div className="w-full lg:w-auto bg-slate-950/80 border border-slate-800 rounded-xl p-5 min-w-[280px]">
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="text-slate-400 font-medium">Progres Pelatihan:</span>
              <span className="font-mono text-amber-400 font-bold">{progressPercent}% Selesai</span>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mb-4">
              <div 
                className="bg-gradient-to-r from-red-600 via-amber-500 to-emerald-500 h-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {existingCert ? (
              <button
                onClick={() => setActiveCertificate(existingCert)}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg"
              >
                <Award className="w-4 h-4" />
                <span>Lihat Sertifikat Diraih</span>
              </button>
            ) : allCompleted ? (
              <button
                onClick={handleClaimCertificate}
                disabled={isGeneratingCert}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold text-xs rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg animate-pulse"
              >
                <Award className="w-4 h-4 text-slate-950" />
                <span>{isGeneratingCert ? 'Menerbitkan...' : 'Klaim Sertifikat Resmi'}</span>
              </button>
            ) : (
              <p className="text-xs text-slate-400 text-center flex items-center justify-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Selesaikan 3 modul untuk sertifikat</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Course Navigation Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {MODULES.map((m, idx) => {
          const isDone = completedModules[idx];
          const isCurrent = activeModuleIdx === idx;
          return (
            <button
              key={m.id}
              onClick={() => setActiveModuleIdx(idx)}
              className={`p-4 rounded-xl border text-left transition-all duration-200 flex items-start gap-3.5 ${
                isCurrent 
                  ? 'bg-slate-800 border-amber-500/50 shadow-md ring-1 ring-amber-500/30' 
                  : isDone
                  ? 'bg-slate-900/80 border-emerald-500/30 hover:border-slate-700'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-mono text-xs font-bold ${
                isDone 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                  : isCurrent 
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' 
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}>
                {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-slate-400">{m.duration}</span>
                  {isDone && <span className="text-emerald-400 font-semibold">Lulus</span>}
                </div>
                <h4 className="text-xs sm:text-sm font-semibold text-white truncate">
                  {m.title}
                </h4>
              </div>
            </button>
          );
        })}
      </div>

      {/* Module Interactive Content Body */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 text-white shadow-xl space-y-8">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Modul {activeModuleIdx + 1} dari 3</span>
            <span>Estimasi Durasi: {currentMod.duration}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            {currentMod.title}
          </h3>
          <p className="text-sm text-slate-300 mt-1">
            {currentMod.overview}
          </p>
        </div>

        {/* Learning Sections */}
        <div className="grid grid-cols-1 gap-6">
          {currentMod.sections.map((sec, sIdx) => (
            <div key={sIdx} className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-5">
              <h4 className="text-sm font-semibold text-amber-400 mb-2">
                {sec.subtitle}
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed">
                {sec.content}
              </p>
            </div>
          ))}
        </div>

        {/* Checkpoint Knowledge Evaluation */}
        <div className="bg-slate-950 border border-amber-500/20 rounded-xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
            <HelpCircle className="w-4 h-4" />
            <span>Evaluasi Pemahaman Materi (Checkpoint Quiz)</span>
          </div>
          
          <p className="text-sm font-medium text-white">
            {currentMod.quiz.question}
          </p>

          <div className="space-y-2.5">
            {currentMod.quiz.options.map((opt, optIdx) => {
              const isSelected = selectedAnswers[activeModuleIdx] === optIdx;
              const hasSubmitted = quizSubmitted[activeModuleIdx];
              const isCorrect = optIdx === currentMod.quiz.correctIndex;
              
              let optStyle = 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300';
              if (isSelected && !hasSubmitted) {
                optStyle = 'bg-amber-500/10 border-amber-500 text-amber-300 ring-1 ring-amber-500/30';
              } else if (hasSubmitted) {
                if (isCorrect) {
                  optStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-200';
                } else if (isSelected && !isCorrect) {
                  optStyle = 'bg-red-500/20 border-red-500 text-red-200';
                }
              }

              return (
                <button
                  key={optIdx}
                  onClick={() => handleSelectAnswer(optIdx)}
                  className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm font-medium transition-colors flex items-center justify-between ${optStyle}`}
                >
                  <span>{opt}</span>
                  {hasSubmitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Quiz Action Feedback */}
          {quizSubmitted[activeModuleIdx] ? (
            <div className={`p-4 rounded-xl text-xs sm:text-sm ${
              selectedAnswers[activeModuleIdx] === currentMod.quiz.correctIndex 
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300' 
                : 'bg-red-500/10 border border-red-500/30 text-red-300'
            }`}>
              <div className="font-semibold mb-1">
                {selectedAnswers[activeModuleIdx] === currentMod.quiz.correctIndex ? 'Jawaban Tepat!' : 'Jawaban Belum Tepat'}
              </div>
              <p className="text-slate-300">{currentMod.quiz.explanation}</p>
              
              {selectedAnswers[activeModuleIdx] !== currentMod.quiz.correctIndex && (
                <button
                  onClick={handleRetryQuiz}
                  className="mt-3 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Ulangi Kuis Modul Ini</span>
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={handleVerifyQuiz}
              disabled={selectedAnswers[activeModuleIdx] === undefined}
              className="py-2.5 px-5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg transition-colors disabled:opacity-40"
            >
              Kirim Jawaban & Selesaikan Modul
            </button>
          )}
        </div>

        {/* Footer Navigation Between Modules */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            onClick={() => setActiveModuleIdx(prev => Math.max(0, prev - 1))}
            disabled={activeModuleIdx === 0}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white disabled:opacity-30 flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Modul Sebelumnya</span>
          </button>

          {activeModuleIdx < MODULES.length - 1 ? (
            <button
              onClick={() => setActiveModuleIdx(prev => Math.min(MODULES.length - 1, prev + 1))}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors"
            >
              <span>Lanjut Modul Berikutnya</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            allCompleted && (
              <button
                onClick={handleClaimCertificate}
                className="px-5 py-2.5 bg-gradient-to-r from-red-800 to-amber-700 hover:from-red-700 hover:to-amber-600 text-white text-xs font-bold rounded-lg flex items-center gap-2 shadow-lg"
              >
                <Award className="w-4 h-4 text-amber-300" />
                <span>Klaim Sertifikat Kelulusan</span>
              </button>
            )
          )}
        </div>
      </div>

      {/* Certificate Viewer Modal */}
      {activeCertificate && (
        <CertificateViewerModal
          certificate={activeCertificate}
          isOpen={!!activeCertificate}
          onClose={() => setActiveCertificate(null)}
        />
      )}
    </div>
  );
}

export default YouthSparkTraining;
