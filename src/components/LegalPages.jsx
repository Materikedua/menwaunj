import React from 'react';
import { Shield, Lock, FileText, CheckCircle, Mail, MapPin, ArrowLeft, ExternalLink, Globe } from 'lucide-react';
import { Link, navigate } from '../lib/router.jsx';

export function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Top Banner / Header */}
      <header className="bg-gradient-to-r from-[#006569] via-[#004d50] to-[#00383b] text-white py-16 px-4 sm:px-6 lg:px-8 border-b-4 border-[#FFDD00]">
        <div className="max-w-4xl mx-auto space-y-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#FFDD00] hover:underline cursor-pointer"
          >
            <ArrowLeft size={16} /> Kembali ke Beranda Utama
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/10 rounded-2xl border border-white/20">
              <Shield size={32} className="text-[#FFDD00]" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#FFDD00] block">
                Dokumen Resmi Tata Kelola Informasi & Kepatuhan Google OAuth
              </span>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white mt-1">
                Kebijakan Privasi Aplikasi (Privacy Policy)
              </h1>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-2xl">
            Portal Resmi Resimen Mahasiswa Jayakarta Satuan Universitas Negeri Jakarta (<span className="text-[#FFDD00] font-mono">menwaunj.or.id</span>). Berlaku efektif sejak 28 Oktober 2026.
          </p>
        </div>
      </header>

      {/* Main Legal Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        {/* Ringkasan Komitmen */}
        <section className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800">
            <CheckCircle size={14} />
            <span>Kepatuhan Transparansi Perlindungan Data Pribadi</span>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed">
            Resimen Mahasiswa Jayakarta Satuan Universitas Negeri Jakarta (selanjutnya disebut <strong>"Menwa UNJ"</strong> atau <strong>"Kami"</strong>) berkomitmen penuh melindungi hak privasi setiap pengguna, peserta kegiatan, taruna, alumni, maupun masyarakat umum yang mengakses portal resmi <strong>https://menwaunj.or.id</strong> dan layanan digital turunannya. Kebijakan Privasi ini menjelaskan secara komprehensif bagaimana kami mengumpulkan, mengakses, menggunakan, menyimpan, dan menjaga kerahasiaan data pengguna, khususnya data yang diperoleh melalui Otentikasi Akun Google (Google Sign-In).
          </p>
        </section>

        {/* 1. Identitas Pengembang & Organisasi */}
        <section className="space-y-3">
          <h2 className="text-xl font-black text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
            <Globe size={20} className="text-[#006569]" />
            1. Identitas Organisasi & Pengelola Layanan
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            Portal ini dikelola secara resmi dan sah oleh:
          </p>
          <div className="bg-slate-100 p-4 rounded-2xl text-xs space-y-1.5 border border-slate-200 font-medium">
            <p><strong>Nama Organisasi:</strong> Resimen Mahasiswa Jayakarta Satuan Universitas Negeri Jakarta (Menwa UNJ)</p>
            <p><strong>Status Badan:</strong> Unit Kegiatan Mahasiswa Bidang Khusus Pertahanan & Ketahanan Bangsa (Bela Negara), Universitas Negeri Jakarta</p>
            <p><strong>Alamat Sekretariat Mako:</strong> Markas Komando Jl. Rawamangun Muka Komplek UNJ Gedung G Lt. I R. 107, Jakarta Timur</p>
            <p><strong>Domain Resmi:</strong> https://menwaunj.or.id</p>
            <p><strong>Kontak Email Resmi:</strong> unjmenwa@gmail.com</p>
            <p><strong>Telepon / Kontak Person (CP):</strong> 0815-2582-3503 (Raffli) / Telp: (081525823503)</p>
          </div>
        </section>

        {/* 2. Penggunaan Data Pengguna Google (Google User Data Policy Compliance) */}
        <section className="space-y-4">
          <h2 className="text-xl font-black text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-2">
            <Lock size={20} className="text-[#006569]" />
            2. Akses, Penggunaan, & Penyimpanan Data Pengguna Google
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            Aplikasi kami menggunakan layanan <strong>Google OAuth 2.0 / Firebase Authentication</strong> untuk mempermudah proses masuk (*1-click Sign-In*) tanpa mengharuskan pengguna mengetik kata sandi secara berulang. Sesuai dengan <em>Google API Services User Data Policy</em>, berikut adalah rincian data Google yang kami akses:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-2">
              <span className="font-mono text-xs font-black text-[#006569] uppercase block">
                .../auth/userinfo.email
              </span>
              <h4 className="font-bold text-sm text-slate-900">Alamat Email</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Digunakan sebagai identitas akun utama untuk login, pengiriman bukti formulir pendaftaran, notifikasi status persuratan, dan penautan sertifikat resmi.
              </p>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-2">
              <span className="font-mono text-xs font-black text-[#006569] uppercase block">
                .../auth/userinfo.profile
              </span>
              <h4 className="font-bold text-sm text-slate-900">Nama & Foto Profil</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Digunakan untuk menampilkan nama resmi pengguna di sertifikat pelatihan/seminar Youth Spark, kartu pendaftaran kontingen, dan header portal.
              </p>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-2">
              <span className="font-mono text-xs font-black text-[#006569] uppercase block">
                openid
              </span>
              <h4 className="font-bold text-sm text-slate-900">Pengenal Unik (UID)</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Digunakan sebagai token pengenal sesi keamanan internal guna memastikan akses formulir hanya dapat dilihat oleh pembuatnya.
              </p>
            </div>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-1.5">
            <p className="font-bold">Batasan Penggunaan Data Google:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Kami <strong>TIDAK</strong> mengakses data sensitif seperti kotak masuk Gmail, kontak telepon, Google Drive pribadi, atau lokasi peta perangkat Anda.</li>
              <li>Data pengguna Google hanya diproses untuk fungsi otentikasi login dan pendaftaran kegiatan resmi Menwa UNJ.</li>
            </ul>
          </div>
        </section>

        {/* 3. Larangan Penjualan & Pembagian Data (No Data Sharing/Selling) */}
        <section className="space-y-3">
          <h2 className="text-xl font-black text-slate-900 border-b border-slate-200 pb-2">
            3. Kebijakan Non-Komersial & Perlindungan Data Pihak Ketiga
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            Menwa UNJ memegang teguh asas kerahasiaan dan integritas organisasi:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-slate-700">
            <li><strong>Tidak Ada Penjualan Data:</strong> Kami tidak pernah menjual, menyewakan, memperdagangkan, atau memonetisasi data pengguna Google kepada pihak ketiga mana pun dalam keadaan apa pun.</li>
            <li><strong>Tidak Digunakan untuk Iklan:</strong> Data pengguna tidak digunakan untuk penargetan iklan pihak ketiga atau pelacakan lintas situs (cross-site tracking).</li>
            <li><strong>Pembagian Terbatas Kedinasan:</strong> Data formulir pengajuan hanya diproses secara internal oleh perangkat dinas berwenang (Dansat, Wadansat, Staf Personalia, Kesekretariatan) untuk kepentingan administratif legalitas kegiatan mahasiswa dan verifikasi kampus.</li>
          </ul>
        </section>

        {/* 4. Penyimpanan & Keamanan Data (Storage & Security) */}
        <section className="space-y-3">
          <h2 className="text-xl font-black text-slate-900 border-b border-slate-200 pb-2">
            4. Keamanan & Retensi Penyimpanan Data
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            Data pengguna disimpan menggunakan pangkalan data terenkripsi Google Firebase Cloud Firestore dengan perlindungan aturan keamanan (<em>Firestore Security Rules</em>) dan enkripsi standar industri (HTTPS/TLS in-transit dan AES-256 at-rest). Data pendaftaran dan akun disimpan selama diperlukan untuk keperluan arsip kegiatan resmi organisasi atau hingga pengguna meminta penghapusan.
          </p>
        </section>

        {/* 5. Hak Pengguna & Penghapusan Data (Data Deletion) */}
        <section className="space-y-3">
          <h2 className="text-xl font-black text-slate-900 border-b border-slate-200 pb-2">
            5. Hak Pengguna & Prosedur Penghapusan Data (Right to Erasure)
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            Setiap pengguna memiliki hak mutlak untuk:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-sm text-slate-700">
            <li>Memperbarui atau menyunting informasi profil pada menu pengaturan akun portal.</li>
            <li>Meminta salinan data pribadi yang tersimpan dalam sistem kami.</li>
            <li>Meminta penghapusan akun beserta seluruh riwayat pendaftaran terkait (*Data Deletion Request*).</li>
          </ul>
          <p className="text-sm text-slate-700 leading-relaxed mt-2">
            Untuk mengajukan permohonan penghapusan data secara permanen, silakan kirimkan email permohonan dengan subjek <strong>"Permohonan Penghapusan Data Akun"</strong> ke <strong>unjmenwa@gmail.com</strong> menggunakan email yang terdaftar. Tim administrasi Mako akan memproses dan menghapus data Anda maksimal dalam 3×24 jam kerja.
          </p>
        </section>

        {/* 6. Pemberitahuan Perubahan Kebijakan */}
        <section className="space-y-3">
          <h2 className="text-xl font-black text-slate-900 border-b border-slate-200 pb-2">
            6. Pemberitahuan Pembaruan Kebijakan Privasi
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            Apabila di masa mendatang terjadi perubahan signifikan terkait cara aplikasi kami mengakses atau menggunakan data pengguna Google, kami wajib dan akan mengumumkan perubahan tersebut secara terbuka pada beranda utama portal <strong>https://menwaunj.or.id</strong> serta mengirimkan pemberitahuan resmi ke alamat email pengguna yang terdaftar sebelum kebijakan baru diberlakukan.
          </p>
        </section>

        {/* 7. Kontak Resmi Pengaduan Privasi */}
        <section className="p-6 bg-slate-900 text-white rounded-3xl space-y-3">
          <h3 className="text-base font-black text-[#FFDD00] uppercase tracking-wider flex items-center gap-2">
            <Mail size={18} />
            Hubungi Petugas Privasi & Keamanan Informasi
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Jika Anda memiliki pertanyaan, keberatan, atau membutuhkan informasi lebih lanjut mengenai Kebijakan Privasi ini, silakan hubungi tim kami:
          </p>
          <div className="text-xs space-y-1 text-slate-200 font-mono">
            <p><strong>Alamat:</strong> Markas Komando Jl. Rawamangun Muka Komplek UNJ Gedung G Lt. I R. 107, Jakarta Timur</p>
            <p><strong>Surel:</strong> unjmenwa@gmail.com / rafflysyahpoetra@gmail.com</p>
            <p><strong>Telepon / CP:</strong> 0815-2582-3503 (Raffli) / Telp: (081525823503)</p>
          </div>
        </section>
      </main>
    </div>
  );
}

export function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Top Banner / Header */}
      <header className="bg-gradient-to-r from-[#006569] via-[#004d50] to-[#00383b] text-white py-16 px-4 sm:px-6 lg:px-8 border-b-4 border-[#FFDD00]">
        <div className="max-w-4xl mx-auto space-y-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#FFDD00] hover:underline cursor-pointer"
          >
            <ArrowLeft size={16} /> Kembali ke Beranda Utama
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/10 rounded-2xl border border-white/20">
              <FileText size={32} className="text-[#FFDD00]" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#FFDD00] block">
                Syarat & Ketentuan Penggunaan Portal Resmi
              </span>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white mt-1">
                Persyaratan Layanan (Terms of Service)
              </h1>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-2xl">
            Aturan penggunaan portal resmi Resimen Mahasiswa Satuan Universitas Negeri Jakarta (<span className="text-[#FFDD00] font-mono">menwaunj.or.id</span>).
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <section className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-3">
          <h2 className="text-lg font-black text-slate-900">1. Penerimaan Ketentuan</h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            Dengan mengakses situs web <strong>https://menwaunj.or.id</strong> atau menggunakan fitur masuk akun Google, Anda menyatakan telah membaca, memahami, dan menyetujui untuk terikat oleh Syarat dan Ketentuan ini serta Kebijakan Privasi kami.
          </p>
        </section>

        <section className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-3">
          <h2 className="text-lg font-black text-slate-900">2. Layanan yang Disediakan</h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            Portal ini menyediakan layanan informasi keorganisasian, pendaftaran kegiatan kejuaraan nasional (Ksatria Cendekia VIII, GERANAT 2026), seminar kewirausahaan pemuda (Youth Spark), verifikasi surat e-dispensasi kedinasan resmi, serta sistem kuis dan gamifikasi taktis.
          </p>
        </section>

        <section className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-3">
          <h2 className="text-lg font-black text-slate-900">3. Tanggung Jawab Akun Pengguna</h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            Pengguna bertanggung jawab menjaga keamanan akun Google miliknya masing-masing. Seluruh aktivitas pengisian formulir pendaftaran, pengunggahan dokumen peserta, atau transaksi donasi charity vote yang dilakukan melalui akun Anda dianggap sah dilakukan oleh pemilik akun bersangkutan.
          </p>
        </section>

        <section className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-3">
          <h2 className="text-lg font-black text-slate-900">4. Hak Cipta & Kekayaan Intelektual</h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            Seluruh konten, logo resmi Menwa UNJ, dokumentasi foto kegiatan, juknis perlombaan, dan desain grafis yang ditampilkan pada portal ini merupakan hak cipta yang dilindungi hukum milik Resimen Mahasiswa Satuan Universitas Negeri Jakarta. Dilarang menggandakan atau menyalahgunakan aset organisasi untuk tujuan penipuan atau kepentingan komersial tanpa izin tertulis.
          </p>
        </section>

        <section className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-3">
          <h2 className="text-lg font-black text-slate-900">5. Hukum yang Mengatur</h2>
          <p className="text-sm text-slate-700 leading-relaxed">
            Ketentuan Layanan ini diatur dan ditafsirkan sesuai dengan hukum Negara Kesatuan Republik Indonesia serta ketentuan regulasi kemahasiswaan Universitas Negeri Jakarta.
          </p>
        </section>
      </main>
    </div>
  );
}
