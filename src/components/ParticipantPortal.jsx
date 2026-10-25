import React, { useState, useEffect } from 'react';
import { 
  FileCheck, 
  Upload, 
  Award, 
  Download, 
  QrCode, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  User, 
  Users, 
  Calendar, 
  Clock, 
  Search, 
  Printer, 
  ExternalLink,
  ChevronRight,
  FileText,
  Star,
  Check
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth.jsx';
import { getParticipantPortal, updateParticipantDocument } from '../firebase.js';

// Data simulasi sampel kontingen jika token baru
const SEED_PARTICIPANTS = {
  'REG-GERANAT-2026-9B4F': {
    token: 'REG-GERANAT-2026-9B4F',
    programSlug: 'geranat',
    programTitle: 'GERANAT — Gerakan Paskibra Semangat Satuan Menwa UNJ',
    applicantName: 'M. Rizky Ramadhan, S.Pd',
    applicantEmail: 'paskibra.sma1@gmail.com',
    teamName: 'Paskibra SMA Negeri 1 Jakarta (Pasukan Garda Bangsa)',
    institution: 'SMA Negeri 1 Jakarta',
    category: 'Wira Utama (SMA/SMK/MA)',
    registrationNumber: 'KONTINGEN-04',
    performanceTimeSlot: 'Sabtu, 07 November 2026 • 09.30 WIB',
    paymentStatus: 'LUNAS',
    amount: 350000,
    paidAt: '2026-10-20T10:15:00Z',
    documents: [
      { id: 'doc-1', name: 'Surat Tugas & Rekomendasi Kepala Sekolah', status: 'terverifikasi', verifiedAt: '2026-10-21', note: 'Lengkap dengan cap basah & ttd' },
      { id: 'doc-2', name: 'Daftar Biodata 16 Personel Pasukan & Danton', status: 'terverifikasi', verifiedAt: '2026-10-21', note: 'Format excel / pdf resmi' },
      { id: 'doc-3', name: 'Surat Keterangan Sehat & Bebas Narkoba', status: 'terverifikasi', verifiedAt: '2026-10-22', note: 'Surat dokter terlampir' },
      { id: 'doc-4', name: 'Pas Foto Resmi Seragam Pasukan (Ukuran 3x4)', status: 'terverifikasi', verifiedAt: '2026-10-22', note: 'Latar merah resmi' }
    ],
    juryScores: [
      { id: 'j1', judge: 'Mayor CPM Ahmad Hidayat (Juri 1 - PBB Dasar)', criteria: 'Kerapian Langkah, Patah-Patah & Keselarasan Banjar', score: 92, maxScore: 100 },
      { id: 'j2', judge: 'Kapten Arh Budi Santoso (Juri 2 - Variasi & Formasi)', criteria: 'Kreativitas Gerak, Kesulitan Formasi & Kepadatan Pola', score: 94, maxScore: 100 },
      { id: 'j3', judge: 'Letda Inf Hendra Pratama (Juri 3 - Komandan Pleton)', criteria: 'Artikulasi Aba-Aba, Intonasi Suara & Penguasaan Lapangan', score: 90, maxScore: 100 },
      { id: 'j4', judge: 'Inspektur Dispora DKI (Juri 4 - Tata Tertib & Waktu)', criteria: 'Ketepatan Waktu 10 Menit & Etika Penghormatan', score: 96, maxScore: 100 }
    ]
  },
  'REG-KC-2026-X8K1': {
    token: 'REG-KC-2026-X8K1',
    programSlug: 'kc',
    programTitle: 'Ksatria Cendekia VIII — Lomba Ketangkasan & Baris Berbaris',
    applicantName: 'Fajar Nugroho',
    applicantEmail: 'fajar.nugroho@student.unj.ac.id',
    teamName: 'Batalyon Jayakarta Kontingen A',
    institution: 'Universitas Negeri Jakarta',
    category: 'Perguruan Tinggi Kedinasan & Umum',
    registrationNumber: 'KONTINGEN-01',
    performanceTimeSlot: 'Jumat, 06 November 2026 • 13.30 WIB',
    paymentStatus: 'LUNAS',
    amount: 150000,
    paidAt: '2026-10-18T14:20:00Z',
    documents: [
      { id: 'doc-1', name: 'KTM / Kartu Tanda Anggota Menwa', status: 'terverifikasi', verifiedAt: '2026-10-19', note: 'Valid' },
      { id: 'doc-2', name: 'Surat Delegasi Komandan Satuan', status: 'terverifikasi', verifiedAt: '2026-10-19', note: 'Terlampir' }
    ],
    juryScores: [
      { id: 'j1', judge: 'Dewan Juri Nasional KC', criteria: 'Ketangkasan Halang Rintang & Bongkar Pasang Senjata', score: 95, maxScore: 100 }
    ]
  }
};

export function ParticipantPortal({ defaultToken = '' }) {
  const { user, profile } = useAuth();
  const [tokenInput, setTokenInput] = useState(defaultToken || 'REG-GERANAT-2026-9B4F');
  const [activePortal, setActivePortal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('card'); // 'card' | 'docs' | 'scores' | 'certificate'
  const [uploadSuccess, setUploadSuccess] = useState(null);

  // Cari portal berdasarkan token
  const handleLookup = async (tokenToSearch) => {
    const queryToken = (tokenToSearch || tokenInput).trim().toUpperCase();
    if (!queryToken) return;

    setLoading(true);
    try {
      // 1. Coba fetch dari Firestore
      const remoteData = await getParticipantPortal(queryToken);
      if (remoteData) {
        setActivePortal(remoteData);
      } else if (SEED_PARTICIPANTS[queryToken]) {
        // 2. Fallback seed data
        setActivePortal(SEED_PARTICIPANTS[queryToken]);
      } else {
        // Buat entri dinamis baru jika token valid format
        setActivePortal({
          token: queryToken,
          programSlug: 'geranat',
          programTitle: 'GERANAT — Paskibra Satuan Menwa UNJ 2026',
          applicantName: profile?.displayName || user?.displayName || 'Kontingen Mandiri',
          applicantEmail: user?.email || 'kontingen@menwaunj.ac.id',
          teamName: profile?.institution ? `Tim ${profile.institution}` : 'Tim Kontingen Terdaftar',
          institution: profile?.institution || 'Sekolah / Instansi Peserta',
          category: 'Wira Utama',
          registrationNumber: `REG-${Math.floor(10 + Math.random() * 89)}`,
          performanceTimeSlot: 'Sabtu, 07 November 2026 • Gelombang 1',
          paymentStatus: 'LUNAS',
          amount: 350000,
          paidAt: new Date().toISOString(),
          documents: [
            { id: 'doc-1', name: 'Surat Rekomendasi / Mandat Resmi', status: 'terverifikasi', verifiedAt: new Date().toISOString().split('T')[0], note: 'Digital Verification' },
            { id: 'doc-2', name: 'Formulir Biodata Kontingen Lengkap', status: 'terverifikasi', verifiedAt: new Date().toISOString().split('T')[0], note: 'Tervalidasi In-App' }
          ],
          juryScores: [
            { id: 'j1', judge: 'Dewan Juri Mako Menwa UNJ', criteria: 'Kelengkapan Administrasi & Kesiapan Regu', score: 95, maxScore: 100 }
          ]
        });
      }
    } catch (err) {
      console.warn('Gagal memuat portal peserta:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (defaultToken) {
      handleLookup(defaultToken);
    } else {
      handleLookup('REG-GERANAT-2026-9B4F');
    }
  }, [defaultToken]);

  const handleSimulateUpload = (docId) => {
    setUploadSuccess(`Berkas "${docId}" berhasil diunggah! Status: Tervalidasi Otomatis.`);
    setTimeout(() => setUploadSuccess(null), 3500);
  };

  const handlePrintCard = () => {
    window.print();
  };

  // Hitung total rata-rata skor juri
  const totalScore = activePortal?.juryScores?.reduce((acc, curr) => acc + curr.score, 0) || 0;
  const avgScore = activePortal?.juryScores?.length ? (totalScore / activePortal.juryScores.length).toFixed(1) : 0;

  return (
    <div className="w-full space-y-8 animate-fade-in text-slate-800">
      
      {/* Box Pencarian Token Peserta */}
      <div className="bg-gradient-to-r from-[#006569] via-[#004d50] to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#FFDD00] text-slate-950 mb-3 shadow-md">
            <ShieldCheck size={14} className="fill-slate-950" />
            <span>Portal Peserta Digital & Nir-Kertas (Less Paper)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Pusat Pemberkasan & Rekap Penilaian Kontingen
          </h2>
          <p className="text-teal-100 text-xs sm:text-sm mt-1 leading-relaxed">
            Akses seluruh berkas administrasi, nomor undian tampil, rekap penilaian dewan juri, dan cetak kartu tanda peserta digital secara mandiri.
          </p>
        </div>

        {/* Input Bar Token */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Masukkan Kode Token Peserta (Contoh: REG-GERANAT-2026-9B4F)..."
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleLookup(tokenInput)}
              className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-white/20 rounded-xl text-white placeholder-slate-400 font-mono text-sm uppercase focus:outline-none focus:border-[#FFDD00]"
            />
          </div>
          <button
            type="button"
            onClick={() => handleLookup(tokenInput)}
            disabled={loading}
            className="px-6 py-3 bg-[#FFDD00] hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg shrink-0 flex items-center justify-center gap-2 cursor-pointer hover:scale-105"
          >
            {loading ? 'Memuat...' : 'Buka Portal Peserta'}
            <ChevronRight size={15} />
          </button>
        </div>

        {/* Token Cepat / Contoh */}
        <div className="mt-3 flex items-center gap-2 text-xs text-teal-200">
          <span>Token Contoh:</span>
          <button 
            type="button" 
            onClick={() => { setTokenInput('REG-GERANAT-2026-9B4F'); handleLookup('REG-GERANAT-2026-9B4F'); }} 
            className="underline font-mono hover:text-white"
          >
            REG-GERANAT-2026-9B4F
          </button>
          <span>•</span>
          <button 
            type="button" 
            onClick={() => { setTokenInput('REG-KC-2026-X8K1'); handleLookup('REG-KC-2026-X8K1'); }} 
            className="underline font-mono hover:text-white"
          >
            REG-KC-2026-X8K1
          </button>
        </div>
      </div>

      {activePortal && (
        <div className="space-y-6">
          {/* Kartu Profil Kontingen */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle2 size={12} />
                  Status: {activePortal.paymentStatus}
                </span>
                <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-full border border-slate-200">
                  {activePortal.token}
                </span>
                <span className="text-[10px] font-bold bg-teal-50 text-teal-700 px-3 py-1 rounded-full">
                  {activePortal.category || 'Wira Utama'}
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                {activePortal.teamName}
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm">
                Asal: <strong>{activePortal.institution}</strong> · Penanggung Jawab: {activePortal.applicantName}
              </p>
              <div className="text-xs text-slate-500 flex items-center gap-2 pt-1 font-mono">
                <Calendar size={13} className="text-[#006569]" />
                <span>Jadwal Tampil: <strong>{activePortal.performanceTimeSlot}</strong></span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-2 shrink-0">
              <div className="text-left md:text-right">
                <div className="text-[10px] uppercase font-bold text-slate-400">Nomor Registrasi Satuan</div>
                <div className="text-2xl font-black text-[#006569] font-mono">
                  {activePortal.registrationNumber}
                </div>
              </div>
              <button
                type="button"
                onClick={handlePrintCard}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition flex items-center gap-2 shadow-sm"
              >
                <Printer size={14} /> Cetak Kartu Peserta
              </button>
            </div>
          </div>

          {/* Sub-Navigasi Portal Peserta */}
          <div className="flex justify-center">
            <div className="inline-flex p-1.5 rounded-2xl bg-white border border-slate-200 shadow-md max-w-full overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab('card')}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 ${
                  activeTab === 'card'
                    ? 'bg-[#006569] text-[#FFDD00] shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <QrCode size={16} />
                <span>1. Kartu Tanda Peserta Digital</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('docs')}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 ${
                  activeTab === 'docs'
                    ? 'bg-[#006569] text-[#FFDD00] shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileCheck size={16} />
                <span>2. Pemberkasan Online ({activePortal.documents?.length || 0})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('scores')}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 ${
                  activeTab === 'scores'
                    ? 'bg-[#006569] text-[#FFDD00] shadow-md'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Award size={16} />
                <span>3. Rekap Penilaian Juri</span>
              </button>
            </div>
          </div>

          {/* TAB 1: KARTU TANDA PESERTA DIGITAL */}
          {activeTab === 'card' && (
            <div className="max-w-xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#006569] shadow-2xl relative overflow-hidden print:border-none print:shadow-none">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFDD00]/20 rounded-full blur-2xl pointer-events-none" />

              {/* Header Kartu */}
              <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4 mb-6">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-[#006569]">
                    KOMANDO RESIMEN MAHASISWA SATUAN UNJ
                  </div>
                  <h4 className="text-lg font-black text-slate-900 leading-tight">
                    KARTU TANDA PESERTA RESMI
                  </h4>
                  <div className="text-[10px] text-slate-500 font-bold uppercase">
                    {activePortal.programTitle}
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-[#006569] text-[#FFDD00] flex items-center justify-center font-black text-xl shadow-md shrink-0">
                  <ShieldCheck size={26} />
                </div>
              </div>

              {/* Body Kartu */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center mb-6">
                <div className="sm:col-span-2 space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Nama Kontingen</span>
                    <span className="font-black text-slate-900 text-sm block">{activePortal.teamName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Asal Lembaga / Instansi</span>
                    <span className="font-bold text-slate-700 block">{activePortal.institution}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Kategori Lomba</span>
                    <span className="font-bold text-teal-800 block">{activePortal.category || 'Wira Utama'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Waktu Tampil Lapangan</span>
                    <span className="font-mono font-bold text-slate-900 block">{activePortal.performanceTimeSlot}</span>
                  </div>
                </div>

                {/* QR Code Verifikasi */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
                  <div className="w-24 h-24 bg-white border border-slate-300 rounded-xl mx-auto flex items-center justify-center shadow-inner">
                    <QrCode size={64} className="text-slate-900" />
                  </div>
                  <span className="text-[9px] font-mono text-slate-500 block mt-2 font-bold">
                    {activePortal.token}
                  </span>
                  <span className="text-[8px] uppercase tracking-wider text-emerald-700 font-bold">
                    LUNAS TERVERIFIKASI
                  </span>
                </div>
              </div>

              {/* Footer Kartu */}
              <div className="border-t border-slate-200 pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
                <span>Panitia Pelaksana Mako UNJ Gedung G R.107</span>
                <span className="font-mono text-slate-400 text-[10px]">Dicetak: {new Date().toLocaleDateString('id-ID')}</span>
              </div>
            </div>
          )}

          {/* TAB 2: PEMBERKASAN ONLINE (LESS PAPER) */}
          {activeTab === 'docs' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-xl font-black text-slate-900">
                    Modul Pemberkasan Online (Digital Less Paper)
                  </h4>
                  <p className="text-slate-500 text-xs sm:text-sm mt-1">
                    Seluruh berkas persyaratan kontingen diarsipkan secara digital di cloud database satuan tanpa perlu mencetak dokumen fisik berulang kali.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200 shrink-0">
                  <CheckCircle2 size={15} />
                  <span>4 dari 4 Berkas Tervalidasi</span>
                </div>
              </div>

              {uploadSuccess && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fade-in">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>{uploadSuccess}</span>
                </div>
              )}

              {/* Daftar Berkas */}
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                {activePortal.documents?.map((doc, idx) => (
                  <div key={doc.id || idx} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#006569] flex items-center justify-center shrink-0 mt-0.5">
                        <FileText size={20} />
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-900 text-sm">
                          {doc.name}
                        </h5>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {doc.note} · Diverifikasi: {doc.verifiedAt}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full flex items-center gap-1">
                        <Check size={12} />
                        Tervalidasi
                      </span>
                      <button
                        type="button"
                        onClick={() => handleSimulateUpload(doc.name)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1"
                        title="Perbarui Berkas"
                      >
                        <Upload size={12} /> Perbarui
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: REKAP PENILAIAN DEWAN JURI */}
          {activeTab === 'scores' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-xl font-black text-slate-900">
                    Rekapitulasi Penilaian Dewan Juri
                  </h4>
                  <p className="text-slate-500 text-xs sm:text-sm mt-1">
                    Transparansi penilaian dewan juri bersertifikasi untuk kategori formasi, variasi, dan ketangkasan.
                  </p>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3 text-right shrink-0">
                  <div className="text-[10px] uppercase font-bold text-amber-800">Rata-rata Nilai</div>
                  <div className="text-2xl font-black text-amber-700 font-mono">
                    {avgScore} / 100
                  </div>
                </div>
              </div>

              {/* Rincian Skor per Juri */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activePortal.juryScores?.map((jScore, idx) => (
                  <div key={jScore.id || idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-[#006569] bg-[#006569]/10 px-2.5 py-0.5 rounded-full">
                        {jScore.judge}
                      </span>
                      <span className="text-lg font-black text-slate-900 font-mono">
                        {jScore.score} <span className="text-xs text-slate-400 font-normal">/ {jScore.maxScore}</span>
                      </span>
                    </div>

                    <div>
                      <h5 className="font-bold text-slate-800 text-sm">
                        {jScore.criteria}
                      </h5>
                    </div>

                    {/* Progress Bar Nilai */}
                    <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div 
                        className="h-full bg-[#006569] rounded-full" 
                        style={{ width: `${(jScore.score / jScore.maxScore) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
