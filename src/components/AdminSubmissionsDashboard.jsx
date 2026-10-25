import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, 
  Download, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertCircle, 
  RefreshCw, 
  ExternalLink,
  ChevronDown,
  Building,
  User,
  Phone,
  Mail,
  Calendar,
  ShieldCheck,
  ArrowUpDown
} from 'lucide-react';
import { getAllSubmissionsForAdmin, updateSubmissionStatus } from '../firebase.js';

export function AdminSubmissionsDashboard() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);
  const [successBanner, setSuccessBanner] = useState('');

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const data = await getAllSubmissionsForAdmin();
      setSubmissions(data || []);
    } catch (err) {
      console.warn('Gagal memuat berkas pendaftaran:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  // Filter & Pencarian
  const filteredList = useMemo(() => {
    let list = [...submissions];

    if (statusFilter !== 'all') {
      list = list.filter(item => (item.status || 'menunggu').toLowerCase() === statusFilter);
    }

    if (categoryFilter !== 'all') {
      list = list.filter(item => (item.serviceType || '').toLowerCase().includes(categoryFilter.toLowerCase()));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(item => 
        (item.fullName || '').toLowerCase().includes(q) ||
        (item.email || '').toLowerCase().includes(q) ||
        (item.institution || '').toLowerCase().includes(q) ||
        (item.phone || '').includes(q) ||
        (item.submissionId || '').toLowerCase().includes(q)
      );
    }

    // Urutkan dari yang terbaru
    return list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [submissions, statusFilter, categoryFilter, searchQuery]);

  // Statistik Ringkasan
  const stats = useMemo(() => {
    const total = submissions.length;
    const pending = submissions.filter(s => !s.status || s.status === 'menunggu').length;
    const approved = submissions.filter(s => s.status === 'disetujui').length;
    const completed = submissions.filter(s => s.status === 'selesai').length;
    return { total, pending, approved, completed };
  }, [submissions]);

  // Ubah Status Pengajuan
  const handleStatusChange = async (submissionId, newStatus) => {
    setUpdatingId(submissionId);
    try {
      await updateSubmissionStatus(submissionId, newStatus);
      setSubmissions(prev => prev.map(s => s.id === submissionId || s.submissionId === submissionId ? { ...s, status: newStatus } : s));
      setSuccessBanner(`Status berkas #${submissionId.substring(0, 8)} berhasil diubah menjadi "${newStatus}".`);
      setTimeout(() => setSuccessBanner(''), 4000);
    } catch (err) {
      console.warn('Gagal mengubah status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Ekspor ke Excel (.CSV)
  const handleExportCSV = () => {
    if (filteredList.length === 0) {
      alert('Tidak ada data pendaftaran untuk diekspor.');
      return;
    }

    // Header Kolom CSV
    const headers = [
      'ID Berkas',
      'Tanggal Pengajuan',
      'Nama Lengkap',
      'Asal Instansi',
      'Pekerjaan',
      'Tanggal Lahir',
      'Nomor WhatsApp/HP',
      'Email',
      'Jenis Layanan / Pendaftaran',
      'Status Berkas',
      'Lampiran PDF',
      'Catatan / Keperluan'
    ];

    // Format baris CSV dengan escaping kutip ganda
    const rows = filteredList.map(item => [
      item.submissionId || item.id || '-',
      item.createdAt ? new Date(item.createdAt).toLocaleString('id-ID') : '-',
      item.fullName || '-',
      item.institution || '-',
      item.occupation || '-',
      item.birthDate || '-',
      item.phone || '-',
      item.email || '-',
      item.serviceType || '-',
      item.status || 'menunggu',
      item.documentPdfName ? `${item.documentPdfName} (${item.documentPdfSizeKb || 0} KB)` : (item.documentPdfBase64 ? 'Ada PDF' : 'Tidak Ada'),
      item.notes ? item.notes.replace(/\r?\n/g, ' ') : '-'
    ]);

    // Gabungkan menjadi format CSV standar dengan UTF-8 BOM agar kompatibel dengan Excel
    const csvContent = '\uFEFF' + [
      headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','),
      ...rows.map(row => row.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(','))
    ].join('\r\n');

    // Buat Blob dan picu unduhan
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const today = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `Rekapitulasi_Pendaftar_Menwa_UNJ_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header Dashboard & Tombol Ekspor */}
      <div className="bg-slate-900 border border-teal-500/30 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-[#006569]/50 text-[#FFDD00] border border-[#FFDD00]/30">
            <ShieldCheck size={14} className="text-[#FFDD00]" />
            <span>Mako Admin Command • Manajemen Berkas Pendaftaran</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Rekapitulasi Pendaftaran & Layanan Masuk
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Kelola seluruh berkas pendaftaran Calon Anggota (Camen LIII), Lomba KC VIII, GERANAT, dan permohonan dinas satuan secara terpadu.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={loadSubmissions}
            disabled={loading}
            className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-2xl transition border border-slate-700"
            title="Segarkan Data"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin text-[#FFDD00]' : ''} />
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-5 py-3.5 bg-[#FFDD00] hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition flex items-center gap-2 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Download size={16} />
            <span>Ekspor ke Excel (.CSV)</span>
          </button>
        </div>
      </div>

      {/* Banner Notifikasi Aksi */}
      {successBanner && (
        <div className="p-4 bg-emerald-950/90 border border-emerald-500/60 rounded-2xl flex items-center gap-3 text-emerald-200 text-xs sm:text-sm shadow-md animate-fade-in">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          <span>{successBanner}</span>
        </div>
      )}

      {/* Kartu Ringkasan Statistik */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Total Berkas Masuk</span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 font-mono">{stats.total}</div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Akumulasi seluruh layanan</span>
        </div>

        <div className="bg-white border border-amber-200 rounded-2xl p-4 sm:p-5 shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 block">Menunggu Verifikasi</span>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 mt-1 font-mono">{stats.pending}</div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Perlu tinjauan Mako</span>
        </div>

        <div className="bg-white border border-teal-200 rounded-2xl p-4 sm:p-5 shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#006569] block">Berkas Disetujui</span>
          <div className="text-2xl sm:text-3xl font-black text-[#006569] mt-1 font-mono">{stats.approved}</div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Lolos verifikasi awal</span>
        </div>

        <div className="bg-white border border-emerald-200 rounded-2xl p-4 sm:p-5 shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 block">Layanan Selesai</span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1 font-mono">{stats.completed}</div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">Tuntas / surat terbit</span>
        </div>
      </div>

      {/* Kontrol Filter & Pencarian */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Kolom Pencarian */}
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama, email, asal kampus/sekolah, atau no HP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-[#006569] text-slate-900"
          />
        </div>

        {/* Filter Kategori & Status */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#006569]"
          >
            <option value="all">Semua Status ({submissions.length})</option>
            <option value="menunggu">Menunggu Verifikasi</option>
            <option value="disetujui">Disetujui</option>
            <option value="selesai">Selesai</option>
            <option value="ditolak">Ditolak</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#006569]"
          >
            <option value="all">Semua Jenis Layanan</option>
            <option value="camen">Pendaftaran Camen LIII</option>
            <option value="kc">Ksatria Cendekia (KC VIII)</option>
            <option value="geranat">Paskibra GERANAT</option>
            <option value="personil">Permohonan Personel</option>
            <option value="barang">Peminjaman Barang/Sarpras</option>
            <option value="pemateri">Pemateri / Instruktur</option>
            <option value="kerjasama">Kerjasama & Sponsorship</option>
          </select>
        </div>
      </div>

      {/* Tabel Data Pendaftar */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-6 h-6 animate-spin text-[#006569]" />
            <span>Memuat database pendaftaran Mako...</span>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="py-20 text-center space-y-3 px-4">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
              <FileText size={26} />
            </div>
            <h4 className="text-base font-bold text-slate-800">Tidak ada berkas yang cocok</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Coba sesuaikan kata kunci pencarian atau ubah filter status dan kategori di atas.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-black tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">No.</th>
                  <th className="py-3.5 px-4">Nama Pemohon & Kontak</th>
                  <th className="py-3.5 px-4">Instansi & Pekerjaan</th>
                  <th className="py-3.5 px-4">Layanan / Giat</th>
                  <th className="py-3.5 px-4">Waktu Masuk</th>
                  <th className="py-3.5 px-4">Status Berkas</th>
                  <th className="py-3.5 px-4 text-right">Aksi Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.map((item, index) => {
                  const status = (item.status || 'menunggu').toLowerCase();
                  const isUpdating = updatingId === (item.submissionId || item.id);

                  return (
                    <tr key={item.id || item.submissionId || index} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-4 font-mono text-slate-400">
                        {index + 1}
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-black text-slate-900 text-sm">
                          {item.fullName || 'Nama Tidak Diketahui'}
                        </div>
                        <div className="flex flex-col gap-0.5 mt-0.5 text-slate-500 text-[11px]">
                          {item.email && (
                            <span className="flex items-center gap-1">
                              <Mail size={11} className="text-slate-400" /> {item.email}
                            </span>
                          )}
                          {item.phone && (
                            <span className="flex items-center gap-1 font-mono">
                              <Phone size={11} className="text-slate-400" /> {item.phone}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-800">
                          {item.institution || 'Universitas Negeri Jakarta'}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {item.occupation || 'Mahasiswa'} {item.birthDate ? `• Lahir: ${item.birthDate}` : ''}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#006569]/10 text-[#006569] max-w-[220px] truncate">
                          {item.serviceType || 'Pendaftaran Camen LIII'}
                        </span>
                        {item.documentPdfBase64 ? (
                          <div className="mt-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                const downloadLink = document.createElement('a');
                                downloadLink.href = item.documentPdfBase64;
                                downloadLink.download = item.documentPdfName || `Berkas-${(item.fullName || 'Pemohon').replace(/\s+/g, '_')}.pdf`;
                                downloadLink.target = '_blank';
                                downloadLink.click();
                              }}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-[10px] font-bold transition shadow-xs cursor-pointer"
                              title="Buka / Unduh Berkas Dokumen PDF"
                            >
                              <FileText size={11} className="text-red-600 shrink-0" />
                              <span className="truncate max-w-[120px]">{item.documentPdfName || 'Dokumen PDF'}</span>
                              <ExternalLink size={10} className="shrink-0" />
                            </button>
                          </div>
                        ) : null}
                        {item.notes && (
                          <p className="text-[11px] text-slate-500 mt-1 italic max-w-xs truncate" title={item.notes}>
                            "{item.notes}"
                          </p>
                        )}
                      </td>

                      <td className="py-4 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        }) : '-'}
                      </td>

                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          status === 'disetujui' ? 'bg-teal-100 text-teal-800' :
                          status === 'selesai' ? 'bg-emerald-100 text-emerald-800' :
                          status === 'ditolak' ? 'bg-red-100 text-red-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {status === 'disetujui' && <CheckCircle2 size={11} />}
                          {status === 'selesai' && <CheckCircle2 size={11} />}
                          {status === 'menunggu' && <Clock size={11} />}
                          {status === 'ditolak' && <XCircle size={11} />}
                          <span>{status}</span>
                        </span>
                      </td>

                      <td className="py-4 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {status !== 'disetujui' && (
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() => handleStatusChange(item.submissionId || item.id, 'disetujui')}
                              className="px-2.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold rounded-lg transition text-[11px]"
                              title="Tandai Disetujui"
                            >
                              Setujui
                            </button>
                          )}
                          {status !== 'selesai' && (
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() => handleStatusChange(item.submissionId || item.id, 'selesai')}
                              className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg transition text-[11px]"
                              title="Tandai Selesai"
                            >
                              Selesai
                            </button>
                          )}
                          {status !== 'ditolak' && (
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() => handleStatusChange(item.submissionId || item.id, 'ditolak')}
                              className="px-2 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-lg transition text-[11px]"
                              title="Tolak Berkas"
                            >
                              Tolak
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

export default AdminSubmissionsDashboard;
