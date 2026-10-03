import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import {
  MotionStyles, Reveal, Stagger, TiltCard, Spotlight, MagneticButton,
  ScrollProgress, Orbit3D, Logo3D, Marquee, Counter, NavBar3D, TabSwitch
} from './MenwaUI';
import { 
  X, 
  Menu, 
  Activity, 
  Send, 
  MessageCircle, 
  Shield, 
  User, 
  Lock, 
  LogIn, 
  AlertCircle, 
  ExternalLink, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Star, 
  Quote, 
  Users, 
  Award, 
  Compass, 
  Target, 
  Briefcase, 
  Wrench, 
  Crosshair, 
  BookOpen, 
  Clock, 
  CheckCircle, 
  MapPin, 
  Phone, 
  Mail, 
  FileText,
  Trophy,
  Sparkles,
  Flame
} from 'lucide-react';

const handleImgError = (e, text, bgColor = '006569', textColor = 'FFDD00') => {
  e.target.onerror = null;
  e.target.src = `https://placehold.co/600x400/${bgColor}/${textColor}?text=${encodeURIComponent(text)}`;
};

const RevealOnScroll = Reveal;

const NAV_ITEMS = [
  { id: 'beranda',      label: 'Beranda',                   icon: <Compass size={20} />,   desc: 'Profil singkat, highlight kegiatan, dan berita terbaru Satuan UNJ.' },
  { id: 'struktur',     label: 'Garis Komando',             icon: <Shield size={20} />,    desc: 'Struktur organisasi, unsur pimpinan, perencana, pelayanan, dan pelaksana.' },
  { id: 'pendidikan',   label: 'Pendidikan dan Pelatihan',  icon: <BookOpen size={20} />,  desc: 'Jenjang Diksar, Suskalak, kursus kader, serta agenda latihan rutin.' },
  { id: 'mako',         label: 'Markas Komando',            icon: <MapPin size={20} />,    desc: 'Lokasi Mako, fasilitas, jam operasional, dan kontak piket.' },
  { id: 'administrasi', label: 'Administrasi Umum',         icon: <FileText size={20} />,  desc: 'Surat-menyurat, arsip, formulir, dan prosedur administrasi satuan.' },
];

const Navigation = (props) => (
  <NavBar3D
    {...props}
    onNavigate={props.handleQuickSearch}
    navItems={NAV_ITEMS}
    MenuIcon={<Menu size={28} />}
    CloseIcon={<X size={28} />}
    onLogoError={(e) => handleImgError(e, 'MENWA UNJ', '006569', 'FFDD00')}
  />
);

const LiveChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: 'Komando! Selamat datang di Portal Komando Resimen Mahasiswa UNJ. Ada yang bisa Piket Mako bantu?', sender: 'admin', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');

    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: 'Siap! Pesan Anda telah diterima oleh Piket Mako Menwa UNJ. Tim operasional akan segera merespon pesan Anda. Widya Castrena Dharma Siddha! ⚡',
        sender: 'admin',
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      }]);
    }, 1500);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end font-sans">
      <div className={`mb-4 bg-white rounded-3xl shadow-2xl overflow-hidden transition-all duration-500 origin-bottom-right transform border border-slate-200 ${isOpen ? 'scale-100 opacity-100 w-80 sm:w-96 h-[500px]' : 'scale-0 opacity-0 w-0 h-0'}`}>
        <div className="bg-gradient-to-r from-[#006569] via-[#004d50] to-[#00383b] p-4 flex justify-between items-center text-white shadow-md relative z-10">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center p-1 overflow-hidden shadow-inner">
                <img 
                  src="logo-menwa-unj.png" 
                  onError={(e) => handleImgError(e, 'MENWA', '006569', 'FFDD00')} 
                  className="w-full h-full object-contain" 
                  alt="Mako Menwa UNJ" 
                />
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#FFDD00] border-2 border-[#006569] rounded-full"></div>
            </div>
            <div>
              <h4 className="font-black text-sm leading-tight tracking-wide">Piket Mako Menwa UNJ</h4>
              <p className="text-[10px] font-medium text-[#FFDD00] flex items-center">
                <Activity size={10} className="mr-1 animate-pulse"/> Siaga Operasional • Fast Response
              </p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-2 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="h-[340px] bg-slate-50 p-4 overflow-y-auto flex flex-col gap-4">
          {messages.map(msg => (
            <div key={msg.id} className={`flex flex-col max-w-[85%] ${msg.sender === 'user' ? 'self-end items-end' : 'self-start items-start'}`}>
              <div className={`p-3 rounded-2xl shadow-sm text-sm ${msg.sender === 'user' ? 'bg-[#006569] text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none font-medium'}`}>
                {msg.text}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.time}</span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-100 flex gap-2 items-center">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ketik pesan untuk Piket Mako..."
            className="flex-grow bg-slate-100 border-none rounded-full px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#006569] focus:outline-none"
          />
          <button 
            type="submit" 
            disabled={!inputMessage.trim()} 
            className="w-10 h-10 bg-[#006569] hover:bg-[#004d50] disabled:bg-slate-300 rounded-full flex items-center justify-center text-white transition-colors flex-shrink-0"
          >
            <Send size={18} className="ml-1" />
          </button>
        </form>
      </div>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-full shadow-[0_10px_30px_rgba(0,101,105,0.4)] flex items-center justify-center transition-all duration-300 hover:scale-110 group ${isOpen ? 'bg-slate-900' : 'bg-gradient-to-r from-[#006569] to-[#004d50] animate-bounce'}`}
      >
        {isOpen ? <X size={28} className="text-white" /> : <MessageCircle size={32} className="text-[#FFDD00]" />}
        {!isOpen && (
          <span className="absolute right-20 bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap shadow-xl transform translate-x-4 group-hover:translate-x-0 pointer-events-none">
            Chat Piket Mako
            <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-slate-900 rotate-45"></div>
          </span>
        )}
      </button>
    </div>
  );
};

const LoginModal = ({ onClose }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('idle');

  const handleLogin = async (e) => {
    e.preventDefault();
    setStatus('loading');

    setTimeout(() => {
      if (userId === 'menwa' || userId === 'menwa@unj.ac.id' || userId === 'admin') {
        setStatus('success');
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setStatus('error');
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md transition-opacity" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl relative border border-slate-200" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-[#006569] transition-all hover:rotate-90 bg-slate-100 p-2 rounded-full"><X size={20} /></button>
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-[#006569] to-[#004d50] text-[#FFDD00] rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-[#006569]/30 transform rotate-3 hover:rotate-12 transition-transform duration-300">
            <Shield size={36} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Portal Anggota Menwa UNJ</h2>
          <p className="text-slate-500 text-sm mt-2">Khusus Anggota Aktif & Pengurus Mako Satuan UNJ</p>
        </div>

        {status === 'error' && (
          <div className="bg-red-50 text-red-700 p-3 rounded-xl text-sm font-bold mb-5 flex items-center border border-red-100">
            <AlertCircle size={16} className="mr-2 shrink-0" /> Nomor Anggota / Password salah!
          </div>
        )}

        {status === 'success' && (
          <div className="bg-emerald-50 text-emerald-800 p-3 rounded-xl text-sm font-bold mb-5 flex items-center border border-emerald-200">
            <CheckCircle size={16} className="mr-2 shrink-0" /> Otorisasi Berhasil! Mengarahkan ke Portal Internal...
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">NPA / Email Staf Menwa</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-[#006569]"><User size={18} className="text-inherit" /></div>
              <input type="text" value={userId} onChange={(e) => setUserId(e.target.value)} className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006569] focus:bg-white font-medium transition-all" placeholder="NPA Menwa UNJ / menwa@unj.ac.id" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Password Enkripsi</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-[#006569]"><Lock size={18} className="text-inherit" /></div>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006569] focus:bg-white font-medium transition-all" placeholder="Masukkan Password" required />
            </div>
          </div>
          <button type="submit" disabled={status === 'loading'} className="w-full bg-gradient-to-r from-[#006569] via-[#004d50] to-[#00383b] hover:from-[#004d50] hover:to-[#002b2d] text-[#FFDD00] font-bold py-4 rounded-xl transition-all shadow-lg shadow-[#006569]/30 flex justify-center items-center mt-2 hover:-translate-y-1">
            {status === 'loading' ? <span className="animate-pulse">Memverifikasi NPA...</span> : <><LogIn size={18} className="mr-2" /> Otorisasi Masuk Mako</>}
          </button>
        </form>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, endValue, color, borderGlow }) => {
  return (
    <TiltCard className="rounded-[2.5rem]" max={8}>
    <Spotlight className="rounded-[2.5rem]">
    <div className={`group bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 md:p-10 text-center shadow-[0_20px_50px_rgba(0,0,0,0.4)] hover:-translate-y-3 ${borderGlow} transition-all duration-500 relative overflow-hidden`}>
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className={`mx-auto w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mb-6 shadow-inner border border-white/10 ${color} group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>{icon}</div>
      <Counter to={endValue} suffix="+" className={`block text-4xl lg:text-6xl font-black mb-3 ${color} drop-shadow-lg`} />
      <div className="text-slate-300 font-extrabold text-xs tracking-[0.25em] uppercase group-hover:text-white transition-colors">{label}</div>
    </div>
    </Spotlight>
    </TiltCard>
  );
};

const BerandaTab = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedNews, setSelectedNews] = useState(null);
  const [isKcModalOpen, setIsKcModalOpen] = useState(false);

  // FILE POSTER & LINK PENDAFTARAN (Dapat Anda edit nama file & link-nya di sini)
  const posterKcVIIIImage = "3X1 KC VIII.jpg"; // Silakan ubah nama file foto poster Anda di sini
  const registrationKcVIIIUrl = "https://bit.ly/PendaftaranKCVIII"; // Link Pendaftaran Resmi

  // DESKRIPSI LOMBA KSATRIA CENDEKIA VIII (Silakan isi/edit teks di bawah ini)
  const kcVIIIDescription = `Resimen Mahasiswa Jayakarta Satuan Universitas Negeri Jakarta dengan bangga mempersembahkan kembali ajang unjuk ketangkasan, ketahanan mental, serta kecerdasan taktis tingkat nasional:

✨ LOMBA NASIONAL KSATRIA CENDEKIA VIII TAHUN 2026 ✨

Ajang kompetisi paling bergengsi bagi prajurit mahasiswa dan pemuda ksatria penerus bangsa! Di sinilah disiplin, kehormatan, kepemimpinan taktis, serta soliditas tim akan diuji hingga batas maksimal di gelanggang juara.

Rapatkan barisan, asah strategi, dan amankan slot kontingen kalian sebelum kuota pendaftaran memenuhi batas maksimal!`;

  const newsList = [
    {
      id: 1,
      title: "Penerimaan Calon Anggota Baru Angkatan LIII Tahun 2026",
      category: "Rekrutmen Menwa",
      date: "Timeline: 20 Agt - 27 Sep 2026",
      image: "FLYER OPREC 2026.png",
      fallbackText: "OPREC MENWA UNJ LIII",
      registrationUrl: "https://bit.ly/PCABMENWA2026",
      postUrl: "https://www.instagram.com/p/DckXz2DSoKV/?utm_source=ig_web_copy_link",
      ctaText: "Segera Daftarkan Dirimu Sekarang!",
      content: `We Are Looking for The Chosen One!\nMenwa UNJ Angkatan LIII membuka pintu untuk jiwa-jiwa tangguh, disiplin, dan bermental baja. Saatnya buktikan dirimu, bukan hanya jadi mahasiswa biasa, tapi jadi penerus bangsa.\n\nFasilitas & Pendidikan Satuan:\n- Pendidikan Dasar Satuan & Kualifikasi Baret\n- Kursus Dinas Staf & Pendidikan Provos Satuan\n- Kursus Kader Pelaksana, Pelatih Nasional, Intelpam, & Protokoler\n\nPersyaratan: Mahasiswa Aktif UNJ (Angk. 2025-2026), Sehat Jasmani & Rohani, Melengkapi Berkas & Mengikuti Tes Seleksi.`
    },
    {
      id: 2,
      title: "Coming Soon! Latihan Integrasi Pemuda Nusantara Ksatria Cendekia VIII Tahun 2026",
      category: "Giat Nasional",
      date: "Coming Soon 2026",
      image: "3X1 KC VIII.jpg",
      fallbackText: "KSATRIA CENDEKIA VIII",
      postUrl: "https://www.instagram.com/kc_menwaunj/",
      content: `Medan laga bagi para ksatria intelektual akan segera dibuka! Persiapkan fisik, asah strategi, dan kunci fokusmu menuju gelanggang kompetisi paling bergengsi! 🦅🎯\n\nResimen Mahasiswa Jayakarta Satuan Universitas Negeri Jakarta bersiap mempersembahkan kembali:\n\n✨ KSATRIA CENDEKIA VIII TAHUN 2026 ✨\n\nAjang unjuk ketangkasan, ketahanan mental, serta kecerdasan taktis tingkat nasional bagi generasi muda penerus bangsa. Di sinilah disiplin, kehormatan, dan soliditas tim akan diuji hingga batas maksimal!\n\nKunci targetmu, rapatkan barisan, dan nantikan pengumuman resmi tanggal pendaftaran serta mata lombanya!\nApakah satuan dan timmu sudah siap merebut tahta juara?\n\nAktifkan lonceng notifikasi dan pantau terus kanal resmi kami agar tidak tertinggal instruksi selanjutnya!`
    },
    {
      id: 3,
      title: "Coming Soon Gerakan Paskibra Semangat VII Tahun 2026",
      category: "Kompetisi Paskibra",
      date: "Coming Soon 2026",
      image: "CS GERANAT VII.jpg",
      fallbackText: "GERANAT VII 2026",
      postUrl: "https://www.instagram.com/geranat_menwaunj/",
      content: `𝙋𝘼𝙎𝙐𝙆𝘼𝙉🔥\nRapatkan barisan, satukan langkah, kobarkan semangat! 🦅🇮🇩\n\nResimen Mahasiswa Jayakarta Satuan Universitas Negeri Jakarta dengan bangga mempersembahkan kembali:\n\n✨ 𝐆𝐄𝐑𝐀𝐊𝐀𝐍 𝐏𝐀𝐒𝐊𝐈𝐁𝐑𝐀 𝐒𝐄𝐌𝐀𝐍𝐆𝐀𝐓 𝐕𝐈𝐈 (𝐆𝐄𝐑𝐀𝐍𝐀𝐓) 𝐓𝐀𝐇𝐔𝐍 𝟐𝟎𝟐𝟔 ✨\n\n🏆 𝙇𝙤𝙢𝙗𝙖 𝙁𝙤𝙧𝙢𝙖𝙨𝙞 𝙋𝙚𝙣𝙜𝙞𝙗𝙖𝙧𝙖𝙣 𝘽𝙚𝙣𝙙𝙚𝙧𝙖 🏆\n\n🦅 𝑮𝑨𝑹𝑼𝑫𝑨 𝑵𝑼𝑺𝑨𝑵𝑻𝑨𝑹𝑨\n“𝙼𝚎𝚕𝚊𝚗𝚐𝚔𝚊𝚑 𝚙𝚎𝚗𝚞𝚑 𝚋𝚎𝚛𝚊𝚗𝚒, 𝚋𝚎𝚛𝚜𝚊𝚝𝚞 𝚍𝚊𝚕𝚊𝚖 𝚙𝚛𝚎𝚜𝚝𝚊𝚜𝚒”\n\nSetiap hentakan adalah keberanian.\nSetiap formasi adalah hasil kerja keras.\nKarena saat aba-aba diberikan, tidak ada lagi keraguan ⚔️💥\n\n𝐀𝐑𝐄 𝐘𝐎𝐔 𝐑𝐄𝐀𝐃𝐘 𝐓𝐎 𝐁𝐄 𝐓𝐇𝐄 𝐍𝐄𝐗𝐓 𝐆𝐄𝐑𝐀𝐍𝐀𝐓-𝐈𝐎𝐍?`
    },
    {
      id: 4,
      title: "Menwa UNJ dan Mahasiswa Mappi Gelar Pengabdian Masyarakat serta Latihan Pemantapan Komando di Cianjur",
      category: "Bakti Masyarakat & Giat",
      date: "3 – 7 Juni 2026",
      image: "Menwa UNJ_Pengabdian Cianjur.jpg",
      fallbackText: "PENGABDIAN CIANJUR 2026",
      postUrl: "https://unj.ac.id/menwa-unj-dan-mahasiswa-mappi-gelar-pengabdian-masyarakat-serta-latihan-pemantapan-komando-di-cianjur/",
      content: `Semangat pengabdian, kebersamaan, dan pembentukan karakter mewarnai kegiatan Pengabdian Masyarakat dan Latihan Pemantapan Komando 2026 yang dilaksanakan Resimen Mahasiswa (Menwa) Jayakarta Satuan UNJ bersama Mahasiswa Program Beasiswa MAPPI di Kabupaten Cianjur, Jawa Barat, pada 3–7 Juni 2026.\n\nSelama lima hari, peserta tidak hanya menjalani pembinaan kepemimpinan dan ketahanan fisik, tetapi juga hadir di tengah masyarakat melalui berbagai kegiatan edukasi dan pengabdian. Penyuluhan kesehatan, pendidikan, lingkungan, serta mitigasi bencana di Desa Balegede menjadi bagian dari kontribusi nyata mahasiswa dalam menjalankan Tri Dharma Perguruan Tinggi.\n\nRangkaian kegiatan juga diisi dengan latihan lapangan, longmarch di wilayah Cianjur Selatan, pembelajaran survival, hingga tradisi pembaretan di Pantai Ciwidig sebagai simbol penyelesaian Latihan Pemantapan Komando.\n\nTerima kasih kepada pimpinan UNJ, Pemerintah Kabupaten Cianjur, pemerintah kecamatan dan desa, tokoh masyarakat, serta seluruh pihak yang telah mendukung kelancaran kegiatan ini.`
    }
  ];

  const cardPosts = [
    {
      id: 1,
      title: "ANJANGSANA MENWA UNJ X KSR PMI UNJ",
      category: "Sinergi Kemanusiaan",
      desc: "Mempererat tali silaturahmi, membangun sinergi lintas organisasi, dan menyatukan tekad pengabdian kemanusiaan di lingkungan kampus hijau rawamangun!",
      link: "https://www.instagram.com/p/DcvjdmmEu9x/?utm_source=ig_web_copy_link&stkn=MzRlODBiNWFlZA==",
      image: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=800&q=80",
      fallbackText: "ANJANGSANA MENWA X KSR"
    },
    {
      id: 2,
      title: "KURSUS DINAS STAF SATUAN GABUNGAN 2026",
      category: "Dinas Staf & Kepemimpinan",
      desc: "Menempa kemampuan manajerial, mempertajam analisis staf, dan memperkokoh interoperabilitas antar-satuan demi terwujudnya roda organisasi komando yang solid dan profesional.",
      link: "https://www.instagram.com/p/DcvaTHGklo-/?utm_source=ig_web_copy_link&stkn=MzRlODBiNWFlZA==",
      image: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80",
      fallbackText: "KURSUS STAF GABUNGAN"
    },
    {
      id: 3,
      title: "UPACARA HUT KE-81 RI DI UNJ",
      category: "Protokoler Upacara",
      desc: "Semangat kemerdekaan terus berkobar dalam jiwa prajurit intelektual penjaga kedaulatan bangsa!",
      link: "https://www.instagram.com/reel/DcJT9UmKFrZ/?utm_source=ig_web_copy_link",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80",
      fallbackText: "HUT KE-81 RI UNJ"
    },
    {
      id: 4,
      title: "After Movie KC VII Tahun 2025",
      category: "Giat Dokumentasi",
      desc: "🔥 Saksikan keseruan dan momen penuh semangat dalam AFTER MOVIE KSATRIA CENDEKIA VII TAHUN 2025! 🔥 Dari awal pembukaan khidmat hingga perlombaan menegangkan terekam sempurna.",
      link: "https://www.instagram.com/reel/DPo1NDSAWg9/?utm_source=ig_web_copy_link&stkn=MzRlODBiNWFlZA==",
      image: "https://images.unsplash.com/photo-1517649763962-0c623266010b?auto=format&fit=crop&w=800&q=80",
      fallbackText: "AFTER MOVIE KC VII"
    },
    {
      id: 5,
      title: "STUDI BANDING MENWA IPB X UNJ",
      category: "Kerjasama Satuan",
      desc: "Kegiatan studi banding dilaksanakan pada Sabtu, 23 Mei 2026 di Mako Menwa UNJ dalam rangka saling berbagi ilmu, pengalaman, serta mempererat silaturahmi antar satuan.",
      link: "https://www.instagram.com/reel/DYuKdzKJuFV/?utm_source=ig_web_copy_link",
      image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80",
      fallbackText: "MENWA IPB X UNJ"
    },
    {
      id: 6,
      title: "KEMANUNGGALAN MENWA UNJ DI TANAH CIANJUR",
      category: "Pengabdian & Baksos",
      desc: "Resimen Mahasiswa Jayakarta Satuan UNJ sukses menuntaskan Misi Integrasi Besar: Kegiatan Pengabdian Masyarakat dan Latihan Pemantapan Komando 2026 di Kabupaten Cianjur! 🦅🎒",
      link: "https://www.instagram.com/p/Da18utmEoZO/?utm_source=ig_web_copy_link&stkn=MzRlODBiNWFlZA==",
      image: "Menwa UNJ_Pengabdian Cianjur.jpg",
      fallbackText: "MENWA CIANJUR 2026"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === newsList.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(timer);
  }, [newsList.length]);

  return (
    <div className="bg-slate-50 flex-grow font-sans">
      {/* HERO SECTION */}
      <section className="relative w-full py-28 md:py-40 flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-slate-950 via-[#00383b] to-[#006569]">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center bg-no-repeat bg-fixed opacity-15 mix-blend-luminosity z-0"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-[#00383b]/80 to-slate-950/95 z-0"></div>

        <Orbit3D className="z-10" />

        <RevealOnScroll className="relative z-20 flex flex-col items-center px-4 max-w-6xl text-center">
          <Logo3D onError={(e) => handleImgError(e, 'MENWA UNJ', '006569', 'FFDD00')} />

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight mb-2 drop-shadow-md mt-8">
            <span className="text-white">KOMANDO RESIMEN MAHASISWA </span>
            <span className="mu-shimmer">JAYAKARTA</span>
          </h1>
          
          <div className="text-[#FFDD00] font-extrabold text-2xl md:text-4xl tracking-widest uppercase my-2 drop-shadow-lg">
            SATUAN UNIVERSITAS NEGERI JAKARTA
          </div>

          <div className="h-1.5 w-40 bg-gradient-to-r from-[#006569] via-[#FFDD00] to-[#006569] rounded-full my-6 shadow-[0_0_20px_rgba(255,221,0,0.8)]"></div>

          <p className="text-slate-100 text-lg md:text-2xl font-semibold max-w-4xl italic leading-relaxed drop-shadow-md bg-black/40 px-6 py-4 rounded-2xl border border-white/10 backdrop-blur-sm">
            "Penyempurnaan Pengabdian dengan Ilmu Pengetahuan dan Ilmu Olah Keprajuritan."
          </p>

          <div className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#006569]/50 to-[#00383b]/60 border border-[#FFDD00]/60 rounded-full text-[#FFDD00] font-black text-xs md:text-sm tracking-widest uppercase shadow-md">
            <Shield size={16} className="text-[#FFDD00] animate-pulse" /> WIDYA CASTRENA DHARMA SIDDHA
          </div>
        </RevealOnScroll>

        <Marquee
          className="relative z-20 mt-10 py-3 border-y border-white/10 bg-black/30 w-full"
          items={['Widya Castrena Dharma Siddha', 'Disiplin', 'Loyalitas', 'Kehormatan', 'Satuan UNJ']}
        />
      </section>

      {/* ULTRA HIGHLIGHT: PENDAFTARAN LOMBA NASIONAL KSATRIA CENDEKIA VIII */}
      <section className="relative z-30 -mt-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <RevealOnScroll>
          <TiltCard className="rounded-[2.5rem]" max={4} lift={6}>
          <Spotlight className="rounded-[2.5rem]">
          <div 
            onClick={() => navigate('/kc')}
            className="group relative cursor-pointer overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-slate-950 via-[#00383b] to-slate-950 border-2 border-[#FFDD00] p-8 md:p-12 shadow-[0_0_50px_rgba(255,221,0,0.35)] hover:shadow-[0_0_80px_rgba(255,221,0,0.6)] transition-all duration-500 hover:-translate-y-2"
          >
            {/* Ambient Backlight Glow */}
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#FFDD00]/20 rounded-full blur-3xl pointer-events-none group-hover:bg-[#FFDD00]/30 transition-all"></div>
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#006569]/40 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 md:gap-12">
              <div className="flex-1 text-left">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFDD00] text-slate-950 rounded-full font-black text-xs md:text-sm uppercase tracking-widest mb-6 shadow-lg shadow-[#FFDD00]/20 animate-pulse">
                  <Flame size={18} className="text-red-600 animate-bounce" />
                  <Sparkles size={16} className="text-amber-700" />
                  <span>Highlight Utama • Giat Nasional 2026</span>
                </div>

                <h2 className="text-3xl md:text-5xl font-black text-white leading-tight mb-4 tracking-tight group-hover:text-[#FFDD00] transition-colors drop-shadow-xl">
                  Pendaftaran Lomba Nasional <br className="hidden md:block"/>
                  <span className="text-[#FFDD00] underline decoration-[#FFDD00]/40">Ksatria Cendekia VIII</span> Tahun 2026
                </h2>

                <p className="text-slate-200 text-sm md:text-base font-medium max-w-2xl leading-relaxed mb-8 line-clamp-3">
                  Ajang unjuk ketangkasan, ketahanan mental, serta kecerdasan taktis paling bergengsi tingkat nasional! Klik kartu ini untuk melihat detail lengkap syarat, info pelaksanaan, dan foto poster resmi.
                </p>

                <div className="flex flex-wrap items-center gap-4">
                  <MagneticButton
                    as="a"
                    href={registrationKcVIIIUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-2.5 bg-[#FFDD00] hover:bg-yellow-400 text-[#00383b] font-black px-8 py-4 rounded-2xl shadow-xl transition-colors text-sm md:text-base uppercase tracking-wider border border-white/40"
                  >
                    <Trophy size={20} className="text-[#00383b]" />
                    <span>Segera Daftarkan Tim Kalian!</span>
                    <ExternalLink size={18} />
                  </MagneticButton>

                  <button 
                    onClick={(e) => { e.stopPropagation(); navigate('/kc'); }}
                    className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-4 rounded-2xl border border-white/20 backdrop-blur-md transition-all text-sm hover:border-[#FFDD00]"
                  >
                    <BookOpen size={18} className="text-[#FFDD00]" />
                    <span>Lihat Penjelasan & Poster</span>
                  </button>
                </div>
              </div>

              {/* Poster Card Thumbnail Preview */}
              <div className="w-full lg:w-80 flex-shrink-0 relative group/poster">
                <div className="relative rounded-2xl overflow-hidden border-4 border-[#FFDD00]/80 shadow-2xl bg-slate-900 aspect-[3/4] transform group-hover/poster:scale-105 transition-transform duration-500">
                  <img 
                    src={posterKcVIIIImage} 
                    onError={(e) => handleImgError(e, 'POSTER KSATRIA CENDEKIA VIII 2026', '00383b', 'FFDD00')} 
                    alt="Poster Lomba Ksatria Cendekia VIII 2026"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60"></div>
                  <div className="absolute bottom-4 left-4 right-4 bg-slate-950/80 backdrop-blur-md p-3 rounded-xl border border-white/20 text-center">
                    <span className="text-[#FFDD00] text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5">
                      <ExternalLink size={14} /> Klik Untuk Memperbesar
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          </Spotlight>
          </TiltCard>
        </RevealOnScroll>
      </section>

      {/* MODAL HIGHLIGHT DETAIL KSATRIA CENDEKIA VIII */}
      {isKcModalOpen && (
        <div 
          className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md transition-opacity" 
          onClick={() => setIsKcModalOpen(false)}
        >
          <div 
            className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative border-2 border-[#FFDD00]" 
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setIsKcModalOpen(false)} 
              className="absolute top-4 right-4 bg-slate-950/80 hover:bg-[#006569] text-white p-3 rounded-full transition-all hover:rotate-90 z-20 shadow-xl"
            >
              <X size={22} />
            </button>

            <div className="p-6 md:p-10">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="px-4 py-1.5 bg-[#FFDD00] text-[#00383b] font-black tracking-wider rounded-full text-xs uppercase shadow-md flex items-center gap-1.5">
                  <Trophy size={14} /> Highlight Lomba Nasional
                </span>
                <span className="text-slate-600 text-xs flex items-center font-bold bg-slate-100 px-3 py-1.5 rounded-full">
                  <Calendar size={14} className="mr-1.5 text-[#006569]" /> Tahun 2026
                </span>
              </div>

              <h2 className="text-2xl md:text-4xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
                Pendaftaran Lomba Nasional Ksatria Cendekia VIII Tahun 2026
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-8">
                {/* Poster Foto Display */}
                <div className="lg:col-span-5 rounded-2xl overflow-hidden border-2 border-slate-200 shadow-xl bg-slate-900">
                  <img 
                    src={posterKcVIIIImage} 
                    onError={(e) => handleImgError(e, 'POSTER KSATRIA CENDEKIA VIII 2026', '00383b', 'FFDD00')} 
                    alt="Poster Resmi Ksatria Cendekia VIII" 
                    className="w-full h-auto object-cover" 
                  />
                </div>

                {/* Penjelasan Lomba */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                    <h4 className="font-black text-slate-900 text-sm uppercase tracking-wider mb-3 flex items-center text-[#006569]">
                      <Sparkles size={16} className="mr-2" /> Penjelasan & Detail Lomba:
                    </h4>
                    <p className="text-slate-700 text-sm font-medium leading-relaxed whitespace-pre-line">
                      {kcVIIIDescription}
                    </p>
                  </div>

                  {/* Highlight Box Tautan Pendaftaran */}
                  <div className="p-6 bg-gradient-to-br from-[#00383b] via-[#006569] to-slate-950 rounded-2xl shadow-xl text-white border border-[#FFDD00]/50">
                    <h4 className="text-[#FFDD00] font-black text-base mb-2 flex items-center">
                      <Flame size={18} className="mr-2 text-red-400" /> Tautan Pendaftaran Resmi
                    </h4>
                    <p className="text-slate-200 text-xs mb-5 font-medium">
                      Klik tombol di bawah ini untuk mengakses formulir pendaftaran Lomba Nasional Ksatria Cendekia VIII:
                    </p>

                    <a
                      href={registrationKcVIIIUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-[#FFDD00] hover:bg-yellow-400 text-[#00383b] font-black px-6 py-3.5 rounded-xl shadow-xl hover:-translate-y-0.5 transition-all text-sm uppercase tracking-wider"
                    >
                      Segera Daftarkan Tim Kalian!
                      <ExternalLink size={16} />
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-200">
                <button
                  onClick={() => setIsKcModalOpen(false)}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-2.5 rounded-xl text-xs tracking-wider uppercase"
                >
                  Tutup Modals
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SLIDER BERITA & GIAT MENWA */}
      <section className="relative w-full h-[70vh] md:h-[85vh] bg-slate-950 overflow-hidden">
        {newsList.map((news, index) => (
          <div 
            key={news.id} 
            className={`absolute inset-0 transition-all duration-1000 ease-in-out cursor-pointer ${index === currentSlide ? 'opacity-100 z-10 scale-100' : 'opacity-0 z-0 scale-105'}`} 
            onClick={() => setSelectedNews(news)}
          >
            <div className="absolute inset-0 overflow-hidden">
              <img 
                src={news.image} 
                onError={(e) => handleImgError(e, news.fallbackText, '006569', 'FFDD00')} 
                alt={news.title}
                className="w-full h-full object-cover object-center transform scale-105"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />

            <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 lg:px-24 pb-16 md:pb-24 z-10">
              <div className={`inline-flex items-center px-4 py-1.5 bg-gradient-to-r from-[#006569] to-[#004d50] text-[#FFDD00] border border-[#FFDD00]/30 text-xs font-black rounded-full mb-4 uppercase tracking-widest shadow-lg transform transition-all duration-700 delay-300 ${index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                <Activity size={14} className="mr-2 animate-pulse" /> {news.category} • {news.date}
              </div>
              <h2 className={`text-2xl md:text-4xl lg:text-5xl font-black text-white leading-tight mb-4 max-w-5xl hover:text-[#FFDD00] transition-colors drop-shadow-2xl transform duration-700 delay-500 ${index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                {news.title}
              </h2>
              <p className={`text-slate-300 md:text-lg max-w-3xl line-clamp-2 font-medium mb-6 transform transition-all duration-700 delay-700 ${index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                {news.content}
              </p>

              <div className="flex flex-wrap gap-4 items-center z-20">
                {news.registrationUrl && (
                  <a
                    href={news.registrationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-2 bg-[#FFDD00] hover:bg-yellow-400 text-[#00383b] font-black px-6 py-3 rounded-xl shadow-xl hover:-translate-y-1 transition-all text-sm uppercase tracking-wider"
                  >
                    <Send size={16} /> {news.ctaText || "Daftar Sekarang"}
                  </a>
                )}
                {news.postUrl && (
                  <a
                    href={news.postUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-5 py-3 rounded-xl border border-white/20 backdrop-blur-md transition-all text-sm hover:-translate-y-1"
                  >
                    <ExternalLink size={16} /> Buka Link Postingan
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
        
        <div className="absolute top-1/2 -translate-y-1/2 left-4 right-4 flex justify-between z-20 pointer-events-none px-2 md:px-8">
          <button onClick={(e) => { e.stopPropagation(); setCurrentSlide(prev => prev === 0 ? newsList.length - 1 : prev - 1); }} className="pointer-events-auto w-12 h-12 md:w-16 md:h-16 bg-white/10 hover:bg-[#006569] backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 transition-all hover:scale-110 shadow-xl"><ChevronLeft size={32} /></button>
          <button onClick={(e) => { e.stopPropagation(); setCurrentSlide(prev => prev === newsList.length - 1 ? 0 : prev + 1); }} className="pointer-events-auto w-12 h-12 md:w-16 md:h-16 bg-white/10 hover:bg-[#006569] backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 transition-all hover:scale-110 shadow-xl"><ChevronRight size={32} /></button>
        </div>

        <div className="absolute bottom-8 left-6 md:left-24 z-20 flex space-x-3">
          {newsList.map((_, idx) => (
            <div key={idx} className={`h-1.5 rounded-full transition-all duration-700 ${idx === currentSlide ? 'w-16 bg-[#FFDD00] shadow-[0_0_12px_rgba(255,221,0,0.9)]' : 'w-6 bg-white/30'}`} />
          ))}
        </div>
      </section>

      {/* MODAL DETAIL NEWS */}
      {selectedNews && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md transition-opacity" onClick={() => setSelectedNews(null)}>
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative border border-slate-200" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedNews(null)} className="absolute top-6 right-6 bg-slate-900/60 hover:bg-[#006569] text-white p-3 rounded-full transition-all hover:rotate-90 z-10 backdrop-blur-md"><X size={24} /></button>
            <div className="relative w-full h-72 md:h-[400px] bg-slate-900 overflow-hidden">
              <img 
                src={selectedNews.image} 
                onError={(e) => handleImgError(e, selectedNews.fallbackText, '006569', 'FFDD00')} 
                alt="News cover" 
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent"></div>
            </div>
            <div className="p-8 md:p-14 relative z-10 -mt-16">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="px-4 py-1.5 bg-[#006569] text-[#FFDD00] font-black tracking-wider rounded-lg text-xs uppercase shadow-md">{selectedNews.category}</span>
                <span className="text-slate-600 text-xs flex items-center font-bold bg-slate-100 px-3 py-1.5 rounded-lg"><Calendar size={14} className="mr-2 text-[#006569]"/> {selectedNews.date}</span>
              </div>
              <h2 className="text-2xl md:text-4xl font-black text-slate-900 mb-6 leading-tight tracking-tight">{selectedNews.title}</h2>
              <div className="prose prose-lg max-w-none text-slate-800 leading-relaxed font-medium bg-slate-50 p-6 md:p-8 rounded-3xl border border-slate-200 shadow-inner">
                <p className="whitespace-pre-wrap">{selectedNews.content}</p>

                {selectedNews.registrationUrl && (
                  <div className="mt-6 p-6 bg-[#FFDD00]/15 rounded-2xl border border-[#FFDD00]/40 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div>
                      <h4 className="font-black text-slate-900 text-base">Pendaftaran Resmi Dibuka!</h4>
                      <p className="text-slate-600 text-xs font-medium">Klik tombol di samping untuk langsung mengakses formulir Oprec Menwa UNJ 2026.</p>
                    </div>
                    <a
                      href={selectedNews.registrationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#006569] hover:bg-[#004d50] text-[#FFDD00] font-black px-6 py-3 rounded-xl shadow-md text-xs uppercase tracking-wider whitespace-nowrap"
                    >
                      Form Pendaftaran Oprec
                    </a>
                  </div>
                )}

                {selectedNews.postUrl && (
                  <div className="mt-4">
                    <a
                      href={selectedNews.postUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-[#006569] hover:text-[#004d50] font-bold text-sm underline"
                    >
                      <ExternalLink size={16} /> Buka Postingan / Berita Lengkap
                    </a>
                  </div>
                )}

                <div className="mt-8 p-6 bg-gradient-to-r from-[#006569] to-[#00383b] border border-[#004d50] rounded-2xl shadow-xl text-white">
                  <p className="font-bold m-0 flex items-center text-sm md:text-base text-[#FFDD00]">
                    <Star className="mr-3 shrink-0 text-[#FFDD00]" fill="currentColor"/>
                    Widya Castrena Dharma Siddha — Penyempurnaan Pengabdian dengan Ilmu Pengetahuan dan Ilmu Olah Keprajuritan.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6 KOTAK KARTU POSTINGAN GIAT */}
      <section className="py-24 bg-gradient-to-b from-slate-100 to-slate-200 border-t border-slate-200 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <RevealOnScroll className="text-center mb-16">
            <h3 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">Kabar & Giat Terkini Satuan</h3>
            <p className="text-slate-600 font-medium text-base mt-2">Dokumentasi & Aktualisasi Kegiatan Resimen Mahasiswa UNJ</p>
            <div className="h-1.5 w-24 bg-gradient-to-r from-[#006569] to-[#FFDD00] mx-auto mt-4 rounded-full shadow-md"></div>
          </RevealOnScroll>

          <Stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" step={100} from="up">
            {cardPosts.map((card) => (
              <TiltCard key={card.id} className="rounded-3xl h-full" max={6}>
              <Spotlight className="rounded-3xl h-full">
                <a
                  href={card.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white rounded-3xl overflow-hidden shadow-lg border border-slate-200 flex flex-col group hover:shadow-2xl hover:border-[#006569] transition-all duration-300 h-full"
                >
                  <div className="relative h-56 overflow-hidden bg-slate-900">
                    <img 
                      src={card.image} 
                      onError={(e) => handleImgError(e, card.fallbackText, '006569', 'FFDD00')} 
                      alt={card.title} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-80"></div>
                    <span className="absolute top-4 left-4 bg-[#006569]/90 backdrop-blur-md text-[#FFDD00] text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md">
                      {card.category}
                    </span>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <h4 className="font-black text-slate-900 text-lg leading-tight mb-3 group-hover:text-[#006569] transition-colors line-clamp-2">
                      {card.title}
                    </h4>
                    <p className="text-slate-600 text-xs font-medium leading-relaxed mb-6 line-clamp-3 flex-grow">
                      {card.desc}
                    </p>
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#006569] group-hover:text-amber-600 transition-colors">
                      <span className="flex items-center gap-1.5"><ExternalLink size={14} /> Lihat Postingan</span>
                      <ChevronRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </a>
              </Spotlight>
              </TiltCard>
            ))}
          </Stagger>
        </div>
      </section>

      {/* TESTIMONIAL & SUARA SENIOR */}
      <section className="py-24 bg-gradient-to-b from-slate-200 to-slate-100 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <RevealOnScroll className="flex flex-col md:flex-row justify-between items-end mb-16">
            <div>
              <h3 className="text-3xl md:text-5xl font-black text-slate-900 flex items-center tracking-tight">
                <Quote className="text-[#006569] mr-4 shrink-0" size={44} /> Apa Kata Mereka tentang Menwa UNJ
              </h3>
            </div>
          </RevealOnScroll>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            <RevealOnScroll delay={100} className="bg-white rounded-[2rem] p-10 md:p-12 shadow-xl border border-slate-200 hover:-translate-y-3 hover:shadow-2xl hover:shadow-[#006569]/20 transition-all duration-500 relative group flex flex-col justify-between">
              <p className="text-slate-800 text-lg md:text-xl leading-relaxed mb-10 italic font-medium">"Menwa UNJ adalah kawah candradimuka pembentukan karakter mahasiswa. Di sini kalian tidak hanya belajar disiplin, tapi juga nasionalisme, kepemimpinan, dan loyalitas pada bangsa.”</p>
              <div className="flex items-center gap-5 pt-8 border-t border-slate-200">
                <div className="relative shrink-0">
                  <div className="w-16 h-16 rounded-full bg-[#006569] text-[#FFDD00] flex items-center justify-center font-black text-lg border-2 border-[#FFDD00] shadow-md">
                    EE
                  </div>
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-lg leading-tight">Letkol Marinir Edy Effendi, SH., MH.</h4>
                  <p className="text-[#006569] font-bold text-xs mt-1">Kasubdis Multimedia Kesatuan Dinas Penerangan Koarmada RI</p>
                </div>
              </div>
            </RevealOnScroll>

            <RevealOnScroll delay={300} className="bg-gradient-to-br from-slate-900 via-[#00383b] to-[#006569] rounded-[2rem] p-10 md:p-12 shadow-2xl border border-slate-700/50 hover:-translate-y-3 hover:shadow-[#006569]/30 transition-all duration-500 text-white group flex flex-col justify-between">
              <p className="text-slate-100 text-lg md:text-xl leading-relaxed mb-10 italic font-medium">“Menwa UNJ tidak hanya melatih fisik, tetapi juga membentuk pola pikir kritis, mental tangguh, dan kemampuan bekerja sama yang kelak sangat dibutuhkan dalam dunia kerja maupun pengabdian masyarakat sehingga melahirkan generasi muda yang siap menghadapi tantangan zaman.”</p>
              <div className="flex items-center gap-5 pt-8 border-t border-slate-700">
                <div className="relative shrink-0">
                  <div className="w-16 h-16 rounded-full bg-[#FFDD00] text-[#00383b] flex items-center justify-center font-black text-lg border-2 border-white shadow-md">
                    AS
                  </div>
                </div>
                <div>
                  <h4 className="font-black text-white text-lg leading-tight">Drs. Agus Setiaji, M.Si, AAIJ, RFA, RIFA, CHRP.</h4>
                  <p className="text-[#FFDD00] font-bold text-xs mt-1">Ketua IARMI UNJ | Tenaga Ahli BUMN Bidang Process Improvement</p>
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* STATISTIK KEANGGOTAAN */}
      <section className="py-28 bg-slate-950 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <RevealOnScroll className="text-center mb-20">
            <h3 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4 drop-shadow-2xl">Kebanggaan Menwa UNJ</h3>
            <div className="h-1.5 w-32 bg-[#006569] mx-auto rounded-full shadow-[0_0_15px_rgba(0,101,105,0.8)]"></div>
          </RevealOnScroll>

          <Stagger className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8" step={100} from="up">
            <StatCard icon={<Users size={36}/>} label="Anggota Aktif" endValue={50} color="text-[#FFDD00]" borderGlow="group-hover:border-[#FFDD00]/50" />
            <StatCard icon={<Award size={36}/>} label="Prestasi Terdata" endValue={1000} color="text-emerald-400" borderGlow="group-hover:border-emerald-400/50" />
            <StatCard icon={<Compass size={36}/>} label="Giat Pengabdian Masyarakat" endValue={500} color="text-teal-300" borderGlow="group-hover:border-teal-300/50" />
            <StatCard icon={<Shield size={36}/>} label="Penyelenggara Lomba Prov & Nas" endValue={100} color="text-yellow-300" borderGlow="group-hover:border-yellow-300/50" />
          </Stagger>
        </div>
      </section>
    </div>
  );
};

const StrukturOrganisasiTab = ({ onNavigate }) => {
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (id) => {
    setExpandedSection(prev => prev === id ? null : id);
  };

  const unsurPerencana = [
    {
      id: "pam",
      title: "Pengamanan",
      desc: "Perencanaan intelijen, pengamanan mako, serta pengawasan operasional.",
      members: [
        { role: "Kaur Pengamanan", name: "Mario Bagaskara", detail: "FEB / Manajemen (NBP: 21020741495)" },
        { role: "Wa Kaur Pengamanan", name: "Ghifari Ghufron", detail: "FT / Rekayasa Keselamatan Kebakaran" },
        { role: "Staf Pengamanan", name: "Amiliudin Lesmana", detail: "FEB / Administrasi Perkantoran Digital" }
      ]
    },
    {
      id: "ops",
      title: "Operasi",
      desc: "Perencanaan & pelaksanaan giat keprajuritan, latihan komando, dan taktis.",
      members: [
        { role: "Kaur Operasi", name: "Ichsan Ridwan Hafizh", detail: "FEB / Akuntansi Sektor Publik (NBP: 22020742263)" },
        { role: "Wa Kaur Operasi", name: "Alea Afiyanti", detail: "FIKK / Pendidikan Jasmani" }
      ]
    },
    {
      id: "pers",
      title: "Personalia",
      desc: "Pengelolaan keanggotaan, pendaftaran, administrasi, & pembinaan kader.",
      members: [
        { role: "Kaur Personalia", name: "Nadia Windra Zahara", detail: "FISH / Pendidikan Geografi (NBP: 2240742269)" },
        { role: "Wa Kaur Personalia", name: "Anggie Palentrina", detail: "FMIPA / Kimia" },
        { role: "Staf Personalia", name: "Gyan Muhammad Irhamir Subiyantoro", detail: "FT / Rekayasa Keselamatan Kebakaran" }
      ]
    },
    {
      id: "log",
      title: "Logistik",
      desc: "Pengelolaan perlengkapan lapangan, inventaris mako & sarana prasarana.",
      members: [
        { role: "Kaur Logistik", name: "Wanda Putri Amalia", detail: "FPSI / Psikologi (NBP: 22030742265)" },
        { role: "Wa Kaur Logistik", name: "Muhammad Afdhal Abdillah", detail: "FEB / Akuntansi" }
      ]
    },
    {
      id: "ter",
      title: "Teritorial",
      desc: "Bakti masyarakat, kemanunggalan, serta hubungan antar-lembaga/masyarakat.",
      members: [
        { role: "Kaur Teritorial", name: "Aulia Asharany Jasmine", detail: "FIP / Pendidikan Guru Sekolah Dasar" },
        { role: "Wa Kaur Teritorial", name: "Julia Rizqi Rahmawati", detail: "FISH / Pendidikan IPS" },
        { role: "Staf Teritorial", name: "Laras Veby Damayanti", detail: "FISH / PPKn" }
      ]
    },
    {
      id: "putri",
      title: "Keputrian",
      desc: "Pembinaan & pemberdayaan anggota Srikandi Resimen Mahasiswa.",
      members: [
        { role: "Kaur Keputrian", name: "Siti Jaojah", detail: "FIP / Manajemen Pendidikan" },
        { role: "Wa Kaur Keputrian", name: "Hilmi Suciasih", detail: "FIP / Manajemen Pendidikan (NBP: 22030742270)" }
      ]
    }
  ];

  const unsurPelayanan = [
    {
      id: "set",
      title: "Kesekretariatan",
      desc: "Pengelolaan kearsipan resmi, tata persuratan, & administrasi satuan.",
      members: [
        { role: "Kepala Kesekretariatan", name: "Belli Vio Saputra", detail: "FEB / Akuntansi" },
        { role: "Wa Kepala Kesekretariatan", name: "Riza Rahmandawanti", detail: "FBS / Pendidikan Bahasa Mandarin" }
      ]
    },
    {
      id: "mako",
      title: "Markas",
      desc: "Pengelolaan kelancaran operasional, kebersihan, & tata tertib Mako Gedung G.",
      members: [
        { role: "Kepala Markas", name: "Alip Rohman Gunawan", detail: "FT / Rekayasa Keselamatan Kebakaran" },
        { role: "Wa Kepala Markas", name: "Ronis Satia", detail: "FIKK / Ilmu Keolahragaan" },
        { role: "Staf Markas", name: "Muhammad Tendison Iha Tabuni", detail: "FIKK / Pendidikan Jasmani (NBP: 22010742261)" }
      ]
    },
    {
      id: "prov",
      title: "Provos",
      desc: "Penegakan tata tertib, kedisiplinan prajurit, & pengawasan etika satuan.",
      members: [
        { role: "Kepala Provost", name: "Adam Ramadhana", detail: "FBS / Pendidikan Bahasa Inggris" },
        { role: "Wa Kepala Provost", name: "Muhammad Alfonso Hermawan", detail: "FISH / Ilmu Komunikasi" }
      ]
    }
  ];

  const unsurPelaksana = [
    {
      id: "pokpas",
      title: "Komandan Pokok Pasukan",
      desc: "Pimpinan taktis pasukan latihan dan operasional lapangan.",
      members: [
        { role: "Komandan Pokok Pasukan", name: "Ghibthah Maulidya Azzahra", detail: "FIP / Perpustakaan & Sains Informasi" },
        { role: "Wakil Komandan Pokok Pasukan", name: "Gisela Rori", detail: "FPSI / Psikologi" }
      ]
    },
    {
      id: "anggota",
      title: "Jajaran Anggota Satuan",
      desc: "Prajurit jajaran Satuan Menwa UNJ penegak Tri Dharma & bela negara.",
      members: [
        { role: "Anggota Satuan", name: "Romy Nirwana", detail: "FISH / Pendidikan IPS" },
        { role: "Anggota Satuan", name: "Khansa Asma Itsar", detail: "FIKK / Olahraga Rekreasi" },
        { role: "Anggota Satuan", name: "Ibnu Bintang Satriawan", detail: "FMIPA / Kimia" },
        { role: "Anggota Satuan", name: "Revalia Febriani", detail: "FPSI / Psikologi" },
        { role: "Anggota Satuan", name: "Tiara Cendy Julianti", detail: "FPSI / Psikologi" },
        { role: "Anggota Satuan", name: "Lia Bertha Yadohamang", detail: "FT / Pendidikan Teknik Informatika & Komputer" },
        { role: "Anggota Satuan", name: "Ahza Rusyaidi Zaman", detail: "FIKK / Pendidikan Jasmani" },
        { role: "Anggota Satuan", name: "Santi Bapaimu", detail: "FT / Pendidikan Teknik Informatika & Komputer" },
        { role: "Anggota Satuan", name: "Medis Siburian", detail: "FIKK / Pendidikan Jasmani" },
        { role: "Anggota Satuan", name: "Hermina Simanagae", detail: "FT / Pendidikan Teknik Informatika & Komputer" },
        { role: "Anggota Satuan", name: "Paskalina Sami", detail: "FT / Pendidikan Teknik Informatika & Komputer" },
        { role: "Anggota Satuan", name: "Natalia Erma Ive", detail: "FT / Pendidikan Teknik Informatika & Komputer" },
        { role: "Anggota Satuan", name: "Margaretha Fridolin", detail: "FT / Pendidikan Teknik Informatika & Komputer" },
        { role: "Anggota Satuan", name: "Lisa Kriswinda Korwa", detail: "FT / Pendidikan Teknik Informatika & Komputer" },
        { role: "Anggota Satuan", name: "Agustina Lusia", detail: "FT / Pendidikan Teknik Informatika & Komputer" },
        { role: "Anggota Satuan", name: "Muhammad Zickry Iswandi", detail: "FMIPA / Kimia" },
        { role: "Anggota Satuan", name: "Theofila Yakanaimu", detail: "FT / Pendidikan Teknik Informatika & Komputer" },
        { role: "Anggota Satuan", name: "Serlina Sompika", detail: "FIP / Pendidikan Guru Sekolah Dasar" }
      ]
    }
  ];

  return (
    <div className="bg-slate-100 min-h-screen pb-32 font-sans flex-grow">
      <RevealOnScroll className="bg-gradient-to-r from-slate-950 via-[#00383b] to-[#006569] pt-32 pb-48 px-4 text-center relative shadow-2xl overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4">Garis Komando Satuan</h2>
          <p className="text-[#FFDD00] text-lg md:text-xl font-bold max-w-3xl mx-auto">Resimen Mahasiswa Satuan Universitas Negeri Jakarta (SKEP 2026)</p>
          <p className="text-slate-300 text-xs font-semibold mt-2">💡 Klik pada setiap kartu staf untuk melihat nama dan profil anggota yang menjabat</p>
        </div>
      </RevealOnScroll>

      <div className="max-w-7xl mx-auto px-4 -mt-32 relative z-20 space-y-12">
        {/* Pimpinan Section */}
        <Stagger className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto" step={100} from="up">
          <div className="flex justify-center">
            <TiltCard className="rounded-[2.5rem] w-full" max={6}>
            <Spotlight className="rounded-[2.5rem]">
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 text-center w-full shadow-2xl relative group hover:border-[#006569] transition-all">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-[#006569] text-[#FFDD00] text-xs font-black px-5 py-1.5 rounded-full shadow-lg uppercase tracking-widest border border-[#FFDD00]/30">Pimpinan</div>
              <div className="w-28 h-28 mx-auto rounded-full bg-[#00383b] text-[#FFDD00] flex items-center justify-center font-black text-2xl border-4 border-[#006569] shadow-xl mb-4 group-hover:scale-105 transition-transform">
                EHS
              </div>
              <h3 className="font-black text-xl text-slate-900 leading-tight mb-1">Eben Haezer Sitorus</h3>
              <p className="text-[#006569] font-extrabold text-xs uppercase tracking-widest bg-[#006569]/10 py-2 rounded-xl border border-[#006569]/20">Komandan Satuan (NBP: 21020741491)</p>
            </div>
            </Spotlight>
            </TiltCard>
          </div>

          <div className="flex justify-center">
            <TiltCard className="rounded-[2.5rem] w-full" max={6}>
            <Spotlight className="rounded-[2.5rem]">
            <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 border border-slate-700 text-center w-full shadow-xl relative group hover:border-[#FFDD00] transition-all">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-[#FFDD00] text-slate-950 text-xs font-black px-5 py-1.5 rounded-full shadow-lg uppercase tracking-widest">Wakil Pimpinan</div>
              <div className="w-28 h-28 mx-auto rounded-full bg-[#FFDD00] text-slate-950 flex items-center justify-center font-black text-2xl border-4 border-white shadow-lg mb-4 group-hover:scale-105 transition-transform">
                RS
              </div>
              <h3 className="font-black text-xl text-white leading-tight mb-1">Raffli Syahputra</h3>
              <p className="text-[#FFDD00] font-extrabold text-xs uppercase tracking-widest bg-white/10 py-2 rounded-xl border border-white/10">Wakil Komandan Satuan (FEB / Manajemen)</p>
            </div>
            </Spotlight>
            </TiltCard>
          </div>
        </Stagger>

        {/* Unsur Perencana */}
        <RevealOnScroll delay={300} className="bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-12 border border-slate-200">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-black text-slate-900 inline-flex items-center tracking-tight border-b-4 border-[#006569] pb-3">
              <Target className="mr-3 text-[#006569]" size={28}/> Unsur Perencana
            </h3>
            <p className="text-slate-500 mt-3 font-medium text-sm">Klik kartu di bawah untuk membuka daftar pejabat staf perencana.</p>
          </div>
          <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" step={80} from="up">
            {unsurPerencana.map((staf) => {
              const isExpanded = expandedSection === staf.id;
              return (
                <TiltCard key={staf.id} className="rounded-2xl" max={5} glare={false}>
                <Spotlight className="rounded-2xl">
                <div 
                  onClick={() => toggleSection(staf.id)}
                  className={`rounded-2xl p-6 border transition-all duration-300 cursor-pointer ${
                    isExpanded 
                      ? 'bg-[#006569]/5 border-[#006569] shadow-xl ring-2 ring-[#006569]/30' 
                      : 'bg-slate-50 border-slate-200 hover:shadow-lg hover:border-[#006569]'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#006569]/10 text-[#006569] flex items-center justify-center font-black">
                      <Shield size={20} />
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 ${isExpanded ? 'bg-[#006569] text-[#FFDD00]' : 'bg-slate-200 text-slate-700'}`}>
                      {isExpanded ? 'Tutup Profil ▲' : 'Buka Profil ▼'}
                    </span>
                  </div>
                  <h4 className="font-black text-slate-900 text-base mb-1">{staf.title}</h4>
                  <p className="text-slate-600 text-xs font-medium leading-relaxed">{staf.desc}</p>

                  {isExpanded && (
                    <div className="mt-5 pt-4 border-t border-[#006569]/20 space-y-3">
                      <h5 className="text-[11px] font-black uppercase text-[#006569] tracking-wider flex items-center gap-1">
                        <User size={12} /> Pejabat Staf Terdaftar:
                      </h5>
                      {staf.members.map((m, idx) => (
                        <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                          <span className="text-[10px] font-black uppercase tracking-wider text-[#006569] block">{m.role}</span>
                          <span className="font-bold text-slate-900 text-sm block">{m.name}</span>
                          <span className="text-[11px] text-slate-500 font-medium block">{m.detail}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                </Spotlight>
                </TiltCard>
              );
            })}
          </Stagger>
        </RevealOnScroll>

        {/* Unsur Pelayanan */}
        <RevealOnScroll delay={400} className="bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-12 border border-slate-200">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-black text-slate-900 inline-flex items-center tracking-tight border-b-4 border-[#FFDD00] pb-3">
              <Briefcase className="mr-3 text-[#006569]" size={28}/> Unsur Pelayanan
            </h3>
            <p className="text-slate-500 mt-3 font-medium text-sm">Klik kartu untuk membuka pejabat staf kesekretariatan, markas, & provos.</p>
          </div>
          <Stagger className="grid grid-cols-1 sm:grid-cols-3 gap-6" step={80} from="up">
            {unsurPelayanan.map((staf) => {
              const isExpanded = expandedSection === staf.id;
              return (
                <TiltCard key={staf.id} className="rounded-2xl" max={5} glare={false}>
                <Spotlight className="rounded-2xl">
                <div 
                  onClick={() => toggleSection(staf.id)}
                  className={`rounded-2xl p-6 border transition-all duration-300 cursor-pointer ${
                    isExpanded 
                      ? 'bg-[#FFDD00]/10 border-[#006569] shadow-xl ring-2 ring-[#006569]/30' 
                      : 'bg-slate-50 border-slate-200 hover:shadow-lg hover:border-[#006569]'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black">
                      <Wrench size={20} />
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 ${isExpanded ? 'bg-[#006569] text-[#FFDD00]' : 'bg-slate-200 text-slate-700'}`}>
                      {isExpanded ? 'Tutup Profil ▲' : 'Buka Profil ▼'}
                    </span>
                  </div>
                  <h4 className="font-black text-slate-900 text-base mb-1">{staf.title}</h4>
                  <p className="text-slate-600 text-xs font-medium leading-relaxed">{staf.desc}</p>

                  {isExpanded && (
                    <div className="mt-5 pt-4 border-t border-slate-300 space-y-3">
                      <h5 className="text-[11px] font-black uppercase text-[#006569] tracking-wider flex items-center gap-1">
                        <User size={12} /> Pejabat Staf Terdaftar:
                      </h5>
                      {staf.members.map((m, idx) => (
                        <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                          <span className="text-[10px] font-black uppercase tracking-wider text-[#006569] block">{m.role}</span>
                          <span className="font-bold text-slate-900 text-sm block">{m.name}</span>
                          <span className="text-[11px] text-slate-500 font-medium block">{m.detail}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                </Spotlight>
                </TiltCard>
              );
            })}
          </Stagger>
        </RevealOnScroll>

        {/* Unsur Pelaksana */}
        <RevealOnScroll delay={500} className="bg-slate-900 text-white rounded-[2.5rem] shadow-2xl p-8 md:p-12 border border-slate-800">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-black text-white inline-flex items-center tracking-tight border-b-4 border-[#006569] pb-3">
              <Users className="mr-3 text-[#FFDD00]" size={28}/> Unsur Pelaksana
            </h3>
            <p className="text-slate-400 mt-3 font-medium text-sm">Klik kartu untuk melihat jajaran Komandan Pokpas dan Anggota Satuan.</p>
          </div>
          <Stagger className="grid grid-cols-1 md:grid-cols-2 gap-6" step={80} from="up">
            {unsurPelaksana.map((staf) => {
              const isExpanded = expandedSection === staf.id;
              return (
                <TiltCard key={staf.id} className="rounded-2xl" max={5} glare={false}>
                <Spotlight className="rounded-2xl" color="rgba(255,221,0,.18)">
                <div 
                  onClick={() => toggleSection(staf.id)}
                  className={`rounded-2xl p-6 border transition-all duration-300 cursor-pointer ${
                    isExpanded 
                      ? 'bg-[#006569]/40 border-[#FFDD00] shadow-xl ring-2 ring-[#FFDD00]/50' 
                      : 'bg-slate-800/80 border-slate-700 hover:border-[#006569]'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#006569] text-[#FFDD00] flex items-center justify-center font-black">
                      <Crosshair size={20} />
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 ${isExpanded ? 'bg-[#FFDD00] text-slate-950' : 'bg-slate-700 text-slate-300'}`}>
                      {isExpanded ? 'Tutup Profil ▲' : 'Buka Profil ▼'}
                    </span>
                  </div>
                  <h4 className="font-black text-white text-base mb-1">{staf.title}</h4>
                  <p className="text-slate-300 text-xs font-medium leading-relaxed">{staf.desc}</p>

                  {isExpanded && (
                    <div className="mt-5 pt-4 border-t border-slate-700 space-y-3 max-h-96 overflow-y-auto pr-2">
                      <h5 className="text-[11px] font-black uppercase text-[#FFDD00] tracking-wider flex items-center gap-1">
                        <User size={12} /> Daftar Prajurit & Pejabat:
                      </h5>
                      {staf.members.map((m, idx) => (
                        <div key={idx} className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                          <span className="text-[10px] font-black uppercase tracking-wider text-[#FFDD00] block">{m.role}</span>
                          <span className="font-bold text-white text-sm block">{m.name}</span>
                          <span className="text-[11px] text-slate-400 font-medium block">{m.detail}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                </Spotlight>
                </TiltCard>
              );
            })}
          </Stagger>
        </RevealOnScroll>
      </div>
    </div>
  );
};

const PendidikanTab = () => {
  const [selectedCourse, setSelectedCourse] = useState(null);

  const pendidikanBertingkat = [
    {
      id: 1,
      title: "Pendidikan Dasar Satuan",
      level: "Pendidikan Bertingkat",
      duration: "5 Hari",
      category: "Bertingkat",
      desc: "Pendidikan tingkat dasar satuan untuk membentuk mental, disiplin, wawasan kebangsaan, dan dasar olah keprajuritan bagi calon anggota Resimen Mahasiswa Jayakarta Satuan UNJ.",
      curriculum: [
        "Kemenwaan: Dasar Organisasi, Sejarah Menwa Satuan, PDRM",
        "Permildas: CMI, PBB, PUDD, PPM, TUM",
        "Pembinaan Jasmani: BDM, Orientasi Medan",
        "Latihan Berganda: Caraka (Pengiriman Pesan Rahasia Pos-to-Pos)",
        "Latihan Teknik/Taktik: Pembuatan Bivak",
        "Pelajaran Pelengkap: Loyalitas, Etika & Moral",
        "Pelajaran Tambahan: Upacara, Jam Komandan, Jam Cadangan"
      ]
    },
    {
      id: 2,
      title: "Latihan Pemantapan Komando",
      level: "Pendidikan Bertingkat",
      duration: "5 Hari",
      category: "Bertingkat",
      desc: "Ujian pemantapan fisik, mental, dan tradisi komando di daerah latihan Koramil Sukamakmur - Curug Benjol Bogor sebelum pengukuhan resmi penyematan Baret Ungu Menwa UNJ.",
      curriculum: [
        "Long March 14 KM (Sukamakmur - Curug Benjol)",
        "Wawasan Kebangsaan & Kemenwaan",
        "Makna Baret & Tradisi Komando",
        "Bivak & Pembuatan Perlindungan",
        "Permildas (TUM & PBB)",
        "Micro Teaching Lapangan & Bakti Sosial",
        "Caraka Malam & Tradisi Pembaretan Curug Benjol"
      ]
    },
    {
      id: 3,
      title: "Kursus Dinas Staf",
      level: "Pendidikan Bertingkat",
      duration: "4 Hari",
      category: "Bertingkat",
      desc: "Menempa kemampuan manajerial, pembuatan naskah dinas staf, perencanaan operasional, serta interoperabilitas antar-seksi staf markas komando.",
      curriculum: [
        "Materi Staf PAM (Pengamanan & Kontra-Intel)",
        "Materi Staf OPS (Operasi & Perencanaan Latihan)",
        "Materi Staf PERS (Personalia & Administrasi)",
        "Materi Staf LOG (Logistik & Perbekalan)",
        "Materi Staf TER (Teritorial & Bakti Masyarakat)",
        "Materi Staf TRIAN, MARKAS, SET, & PROVOST",
        "Materi DANPOKPAS & Jam Komandan"
      ]
    },
    {
      id: 4,
      title: "Pendidikan Provos Satuan",
      level: "Pendidikan Bertingkat",
      duration: "3 Hari",
      category: "Bertingkat",
      desc: "Spesialisasi penegakan disiplin, tata tertib, pengawasan etika keprajuritan, serta pengamanan internal Mako Satuan UNJ.",
      curriculum: [
        "Tupoksi & Wewenang Provos Satuan",
        "Pengendalian Lalu Lintas (Dalalin)",
        "Parade & Penegakan Disiplin",
        "HARTIB (Pemeliharaan Ketertiban)",
        "Intelijen & Taktik Penyelidikan",
        "Pengawalan & Keprotokolan VVIP",
        "PDRM (Peraturan Disiplin Resimen Mahasiswa)",
        "Interogasi, Pengamanan Instalasi, & Loyalitas"
      ]
    }
  ];

  const pendidikanBerjenjang = [
    {
      id: 5,
      title: "Pendidikan Dasar Militer",
      level: "Pendidikan Berjenjang",
      duration: "10 Hari",
      category: "Berjenjang",
      desc: "Pendidikan dasar keprajuritan tingkat utama yang diselenggarakan oleh Kodam/Rindam Jaya untuk membentuk karakter prajurit mahasiswa.",
      curriculum: [
        "Doktrin Pertahanan Negara & Militer Dasar",
        "PBB, Perpang, & Tata Upacara Militer",
        "Navigasi Darat & Kompas Malam",
        "Bela Diri Militer & Ketahanan Fisik Lapangan",
        "Pengetahuan Taktik & Survival"
      ]
    },
    {
      id: 6,
      title: "Kursus Kader Pelaksana",
      level: "Pendidikan Berjenjang",
      duration: "20 Hari",
      category: "Berjenjang",
      desc: "Penggemblengan calon pimpinan operasional dan komandan poko pasukan di tingkat Skomen Jayakarta maupun Nasional.",
      curriculum: [
        "Kepemimpinan Taktis Lapangan (Field Leadership)",
        "Manajemen Operasi Satuan & Teritorial",
        "Analisis Keputusan Krisis & Intelpam",
        "Taktik Pasukan & Pengendalian Massa"
      ]
    },
    {
      id: 7,
      title: "Kursus Dinas Staf",
      level: "Pendidikan Berjenjang",
      duration: "6 Hari",
      category: "Berjenjang",
      desc: "Pendalaman tata kelola dinas staf markas komando tingkat provinsi/Jayakarta.",
      curriculum: [
        "Manajemen Staf Komando Gabungan",
        "Penyusunan Produk Operasional & Logistik Skomen",
        "Interoperabilitas Organisasi Kedinasan",
        "Simulasi Posko Latihan & Komando Ops"
      ]
    },
    {
      id: 8,
      title: "Kursus Pelatih Nasional",
      level: "Pendidikan Berjenjang",
      duration: "10 Hari",
      category: "Berjenjang",
      desc: "Mencetak instruktur dan pelatih bertaraf nasional yang handal dalam mentransfer ilmu olah keprajuritan dan kurikulum Diksar Menwa.",
      curriculum: [
        "Metodologi Pelatihan (Andragogi & CMI)",
        "Psikologi Massa & Teknik Instruksi Lapangan",
        "Penyusunan Kurikulum Latihan Nasional",
        "Standardisasi Evaluasi & Kepelatihan Satuan"
      ]
    },
    {
      id: 9,
      title: "Kursus Kader Pimpinan",
      level: "Pendidikan Berjenjang",
      duration: "20 Hari",
      category: "Berjenjang",
      desc: "Pendidikan kualifikasi pimpinan tertinggi Resimen Mahasiswa tingkat nasional untuk mencetak Komandan Satuan dan Komandan Kompleks.",
      curriculum: [
        "Strategi Pertahanan Nasional & Kebijakan Publik",
        "Kepemimpinan Strategis & Geopolitik",
        "Manajemen Organisasi Tingkat Nasional",
        "Pengambilan Keputusan Strategis & Keamanan Nasional"
      ]
    }
  ];

  const pendidikanLanjutan = [
    {
      id: 10,
      title: "Kursus Kader Pembinaan Mental Nasional",
      level: "Pendidikan Lanjutan",
      duration: "8 Hari",
      category: "Lanjutan",
      desc: "Kursus pembinaan mental, spiritual, dan ideologi kebangsaan untuk menguatkan ketahanan rohani prajurit Menwa.",
      curriculum: [
        "Pembinaan Ideologi Pancasila & Keetikaan",
        "Psikologi Ketahanan Mental Prajurit",
        "Teknik Konseling & Bimsuh Lapangan",
        "Penguatan Moral & Jiwa Korsa Nasional"
      ]
    },
    {
      id: 11,
      title: "Kursus Protokoler",
      level: "Pendidikan Lanjutan",
      duration: "3 Hari",
      category: "Lanjutan",
      desc: "Spesialisasi tata krama keprotokolan negara/universitas, pengawalan jajaran rektorat, dan event management.",
      curriculum: [
        "Keprotokolan Resmi Negara & Perguruan Tinggi",
        "Pengawalan VVIP & Jajaran Kehormatan",
        "Public Relations & Master of Ceremony (MC)",
        "Etika Diplomasi & Tata Tempat Kedinasan"
      ]
    },
    {
      id: 12,
      title: "Kursus Intelijen dan Pengamanan",
      level: "Pendidikan Lanjutan",
      duration: "3 Hari",
      category: "Lanjutan",
      desc: "Pelatihan analisis informasi, kontraintelijen, pengamanan aset vital kampus, dan deteksi dini ancaman kebangsaan.",
      curriculum: [
        "Teknik Penyelidikan, Pengamatan, & Penggalangan",
        "Analisis Informasi & Kontra-Intelijen",
        "Pengamanan Teritorial Kampus & Objek Vital",
        "Siber & Kriptografi Dasar Komando"
      ]
    }
  ];

  return (
    <div className="bg-slate-100 min-h-screen pb-32 font-sans flex-grow">
      {/* Header Banner */}
      <RevealOnScroll className="bg-gradient-to-r from-slate-950 via-[#00383b] to-[#006569] pt-32 pb-48 px-4 text-center relative shadow-2xl overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-[#006569] text-[#FFDD00] rounded-full font-black text-xs uppercase tracking-widest mb-4 border border-[#FFDD00]/30 shadow-md">
            <BookOpen size={16} /> Kurikulum Komando Resimen Mahasiswa UNJ
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4">Pendidikan & Pelatihan Satuan</h2>
          <p className="text-[#FFDD00] text-lg md:text-xl font-bold max-w-3xl mx-auto">
            Membentuk Karakter yang Intelektual, Bermental Baja, dan Berjiwa Ksatria
          </p>
        </div>
      </RevealOnScroll>

      <div className="max-w-7xl mx-auto px-4 -mt-32 relative z-20 space-y-12">
        {/* SUBJUDUL 1: Pendidikan Berjenjang */}
        <RevealOnScroll delay={100} className="bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-12 border border-slate-200">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-black text-slate-900 inline-flex items-center tracking-tight border-b-4 border-[#006569] pb-3">
              <Shield className="mr-3 text-[#006569]" size={28}/> Pendidikan Berjenjang
            </h3>
            <p className="text-slate-500 mt-3 font-medium text-sm">Jenjang pembinaan internal utama anggota Resimen Mahasiswa Satuan UNJ.</p>
          </div>

          <Stagger className="grid grid-cols-1 md:grid-cols-2 gap-6" step={80} from="up">
            {pendidikanBerjenjang.map((course) => (
              <TiltCard key={course.id} className="rounded-2xl" max={5} glare={false}>
              <Spotlight className="rounded-2xl">
              <div 
                onClick={() => setSelectedCourse(course)}
                className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-[#006569] hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between h-full"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="bg-[#006569]/10 text-[#006569] font-black text-[10px] px-3 py-1 rounded-full uppercase tracking-wider">
                      {course.level}
                    </span>
                    <span className="text-xs font-bold text-slate-500 flex items-center">
                      <Clock size={12} className="mr-1 text-[#006569]" /> {course.duration}
                    </span>
                  </div>
                  <h4 className="font-black text-slate-900 text-lg mb-2 group-hover:text-[#006569] transition-colors">
                    {course.title} - {course.duration}
                  </h4>
                  <p className="text-slate-600 text-xs font-medium leading-relaxed line-clamp-3">
                    {course.desc}
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-[#006569]">
                  <span>Lihat Renlat & Detail Modul</span>
                  <ChevronRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
              </Spotlight>
              </TiltCard>
            ))}
          </Stagger>
        </RevealOnScroll>

        {/* SUBJUDUL 2: Pendidikan Bertingkat */}
        <RevealOnScroll delay={200} className="bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-12 border border-slate-200">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-black text-slate-900 inline-flex items-center tracking-tight border-b-4 border-[#FFDD00] pb-3">
              <Award className="mr-3 text-[#006569]" size={28}/> Pendidikan Bertingkat
            </h3>
            <p className="text-slate-500 mt-3 font-medium text-sm">Jenjang pendidikan kualifikasi komando tingkat provinsi dan nasional.</p>
          </div>

          <Stagger className="grid grid-cols-1 md:grid-cols-3 gap-6" step={80} from="up">
            {pendidikanBertingkat.map((course) => (
              <TiltCard key={course.id} className="rounded-2xl" max={5} glare={false}>
              <Spotlight className="rounded-2xl">
              <div 
                onClick={() => setSelectedCourse(course)}
                className="bg-slate-50 rounded-2xl p-6 border border-slate-200 hover:border-[#006569] hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between h-full"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="bg-[#FFDD00] text-slate-950 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                      {course.level}
                    </span>
                    <span className="text-xs font-bold text-slate-500 flex items-center">
                      <Clock size={12} className="mr-1 text-[#006569]" /> {course.duration}
                    </span>
                  </div>
                  <h4 className="font-black text-slate-900 text-base mb-2 group-hover:text-[#006569] transition-colors">
                    {course.title} - {course.duration}
                  </h4>
                  <p className="text-slate-600 text-xs font-medium leading-relaxed line-clamp-3">
                    {course.desc}
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-[#006569]">
                  <span>Lihat Detail Modul</span>
                  <ChevronRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
              </Spotlight>
              </TiltCard>
            ))}
          </Stagger>
        </RevealOnScroll>

        {/* SUBJUDUL 3: Pendidikan Lanjutan */}
        <RevealOnScroll delay={300} className="bg-slate-900 text-white rounded-[2.5rem] shadow-2xl p-8 md:p-12 border border-slate-800">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-black text-white inline-flex items-center tracking-tight border-b-4 border-[#006569] pb-3">
              <Target className="mr-3 text-[#FFDD00]" size={28}/> Pendidikan Lanjutan
            </h3>
            <p className="text-slate-400 mt-3 font-medium text-sm">Pendidikan spesialisasi pembinaan mental, keprotokolan, dan intelijen pengamanan.</p>
          </div>

          <Stagger className="grid grid-cols-1 md:grid-cols-3 gap-6" step={80} from="up">
            {pendidikanLanjutan.map((course) => (
              <TiltCard key={course.id} className="rounded-2xl" max={5} glare={false}>
              <Spotlight className="rounded-2xl" color="rgba(255,221,0,.18)">
              <div 
                onClick={() => setSelectedCourse(course)}
                className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700 hover:border-[#FFDD00] hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between h-full"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="bg-[#006569] text-[#FFDD00] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider border border-[#FFDD00]/30">
                      {course.level}
                    </span>
                    <span className="text-xs font-bold text-slate-400 flex items-center">
                      <Clock size={12} className="mr-1 text-[#FFDD00]" /> {course.duration}
                    </span>
                  </div>
                  <h4 className="font-black text-white text-base mb-2 group-hover:text-[#FFDD00] transition-colors">
                    {course.title} - {course.duration}
                  </h4>
                  <p className="text-slate-300 text-xs font-medium leading-relaxed line-clamp-3">
                    {course.desc}
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-700 flex items-center justify-between text-xs font-bold text-[#FFDD00]">
                  <span>Lihat Spesialisasi</span>
                  <ChevronRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
              </Spotlight>
              </TiltCard>
            ))}
          </Stagger>
        </RevealOnScroll>
      </div>

      {/* Course Detail Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md transition-opacity" onClick={() => setSelectedCourse(null)}>
          <div className="bg-white rounded-3xl w-full max-w-2xl p-8 shadow-2xl relative border border-slate-200" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedCourse(null)} 
              className="absolute top-4 right-4 bg-slate-100 hover:bg-[#006569] hover:text-white p-2 rounded-full transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-3">
              <span className="px-3 py-1 bg-[#006569] text-[#FFDD00] text-[10px] font-black uppercase tracking-wider rounded-lg">
                {selectedCourse.level}
              </span>
              <span className="text-xs font-bold text-slate-500 flex items-center">
                <Clock size={14} className="mr-1 text-[#006569]" /> Durasi: {selectedCourse.duration}
              </span>
            </div>

            <h3 className="text-2xl font-black text-slate-900 mb-3">{selectedCourse.title}</h3>
            <p className="text-slate-600 text-sm font-medium leading-relaxed mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
              {selectedCourse.desc}
            </p>

            <h4 className="font-black text-slate-900 text-sm uppercase tracking-wider mb-3 flex items-center">
              <Target size={16} className="mr-2 text-[#006569]" /> Acara Pendidikan & Materi Utama (Renlat):
            </h4>
            <ul className="space-y-2 mb-8 max-h-60 overflow-y-auto pr-2">
              {selectedCourse.curriculum.map((item, idx) => (
                <li key={idx} className="flex items-center text-xs font-bold text-slate-700 bg-[#006569]/5 p-3 rounded-lg border border-[#006569]/20">
                  <CheckCircle size={16} className="text-[#006569] mr-2 shrink-0" /> {item}
                </li>
              ))}
            </ul>

            <div className="flex justify-end">
              <button 
                onClick={() => setSelectedCourse(null)}
                className="bg-[#006569] hover:bg-[#004d50] text-[#FFDD00] text-xs font-bold px-6 py-3 rounded-xl transition-colors"
              >
                Tutup Detail Pendidikan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MakoTab = () => {
  return (
    <div className="bg-slate-100 min-h-screen pb-32 font-sans flex-grow">
      <RevealOnScroll className="bg-gradient-to-r from-slate-950 via-[#00383b] to-[#006569] pt-32 pb-48 px-4 text-center relative shadow-2xl">
        <div className="max-w-7xl mx-auto relative z-10">
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4">Markas Komando (MAKO)</h2>
          <p className="text-[#FFDD00] text-lg md:text-xl font-bold max-w-3xl mx-auto">Pusat Komando & Pelayanan Administrasi Satuan UNJ</p>
        </div>
      </RevealOnScroll>

      <div className="max-w-7xl mx-auto px-4 -mt-32 relative z-20 space-y-12">
        <RevealOnScroll delay={200} className="bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-12 border border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#006569]/10 text-[#006569] rounded-full font-black text-xs uppercase tracking-widest mb-4">
                <MapPin size={16}/> Lokasi Markas Komando
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-4">Mako Resimen Mahasiswa UNJ</h3>
              <p className="text-slate-600 font-medium leading-relaxed mb-6">
                Jl. R.Mangun Muka Kampus A UNJ Gedung G R.107, RT.11/RW.14, Rawamangun, Kec. Pulo Gadung, Kota Jakarta Timur, Daerah Khusus Ibukota Jakarta 13220
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-slate-700 font-bold text-sm bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <Phone className="text-[#006569] shrink-0" size={20} />
                  <span>WhatsApp (Wakil Komandan): <a href="https://wa.me/6281525823503" target="_blank" rel="noopener noreferrer" className="text-[#006569] underline font-black">+62 815-2582-3503</a></span>
                </div>
                <div className="flex items-center gap-3 text-slate-700 font-bold text-sm bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <Mail className="text-[#006569] shrink-0" size={20} />
                  <span>Email Satuan: <a href="mailto:unjmenwa@gmail.com" className="text-[#006569] underline font-black">unjmenwa@gmail.com</a></span>
                </div>
                <div className="flex items-center gap-3 text-slate-700 font-bold text-sm bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <Clock className="text-[#006569] shrink-0" size={20} />
                  <span>Jam Operasional Piket: Senin - Minggu (08.00 - 22.00 WIB)</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl overflow-hidden shadow-xl border-4 border-white h-80 bg-slate-200 relative">
              <iframe 
                title="Google Maps Mako Menwa UNJ"
                src="https://maps.google.com/maps?q=Mako%20Menwa%20UNJ%20Universitas%20Negeri%20Jakarta&t=&z=16&ie=UTF8&iwloc=&output=embed" 
                className="w-full h-full border-0"
                allowFullScreen="" 
                loading="lazy"
              ></iframe>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </div>
  );
};

const AdministrasiUmumTab = () => {
  const [activeSubTab, setActiveSubTab] = useState('pendaftaran');

  const pendaftaranItems = [
    {
      id: 1,
      title: "Pendaftaran Calon Anggota Angkatan LIII",
      category: "Rekrutmen Camen",
      desc: "Formulir resmi penerimaan Calon Menwa UNJ Angkatan LIII Tahun 2026. Terbuka untuk mahasiswa aktif UNJ.",
      url: "https://bit.ly/PCABMENWA2026",
      status: "Resmi Dibuka",
      statusClass: "bg-emerald-600 text-white",
      ctaText: "Akses Form Pendaftaran Camen"
    },
    {
      id: 2,
      title: "Pendaftaran Lomba Nasional Ksatria Cendekia VIII",
      category: "Giat Perlombaan",
      desc: "Formulir pendaftaran Latihan Integrasi & Kompetisi Pemuda Nusantara Ksatria Cendekia VIII Tahun 2026.",
      url: "https://www.instagram.com/kc_menwaunj/",
      status: "Link Resmi",
      statusClass: "bg-[#FFDD00] text-slate-950",
      ctaText: "Buka Portal Ksatria Cendekia"
    },
    {
      id: 3,
      title: "Pendaftaran Lomba Paskibra GERANAT VI",
      category: "Giat Paskibra",
      desc: "Formulir pendaftaran Lomba Formasi Pengibaran Bendera Gerakan Paskibra Semangat VI Tahun 2026.",
      url: "https://www.instagram.com/geranat_menwaunj/",
      status: "Link Resmi",
      statusClass: "bg-[#FFDD00] text-slate-950",
      ctaText: "Buka Portal GERANAT"
    }
  ];

  const permohonanItems = [
    {
      id: 1,
      title: "Permohonan Pengajuan Personil",
      category: "Operasional & Satgas",
      desc: "Layanan resmi pengajuan personel satgas pengamanan, protokoler upacara, atau bantuan operasional prajurit Menwa UNJ.",
      url: "https://wa.me/6281525823503?text=Halo%20Piket%20Mako%20Menwa%20UNJ,%20saya%20ingin%20mengajukan%20Permohonan%20Pengajuan%20Personil.",
      status: "Siaga Operasional",
      statusClass: "bg-[#006569] text-white",
      ctaText: "Ajukan Permohonan Personil"
    },
    {
      id: 2,
      title: "Permohonan Peminjaman Barang",
      category: "Sarana & Prasarana",
      desc: "Pengajuan resmi peminjaman inventaris perlengkapan lapangan, tenda komando, atau fasilitas Mako Gedung G R.107.",
      url: "https://wa.me/6281525823503?text=Halo%20Piket%20Mako%20Menwa%20UNJ,%20saya%20ingin%20mengajukan%20Permohonan%20Peminjaman%20Barang.",
      status: "Siaga Operasional",
      statusClass: "bg-[#006569] text-white",
      ctaText: "Ajukan Peminjaman Barang"
    },
    {
      id: 3,
      title: "Permohonan Pemateri / Instruktur / Narasumber",
      category: "Pendidikan & Pelatihan",
      desc: "Permohonan instruktur PBB, tata upacara, pelatihan kedisiplinan, wawasan kebangsaan, pembentukan karakter, dan survival.",
      url: "https://wa.me/6281525823503?text=Halo%20Piket%20Mako%20Menwa%20UNJ,%20saya%20ingin%20mengajukan%20Permohonan%20Pemateri/Instruktur.",
      status: "Siaga Operasional",
      statusClass: "bg-[#006569] text-white",
      ctaText: "Ajukan Pemateri / Instruktur"
    }
  ];

  const kerjasamaItems = [
    {
      id: 1,
      title: "Kerjasama Sponsorship",
      category: "Kemitraan Satuan",
      desc: "Pengajuan proposal kemitraan dukungan sponsorship dana maupun in-kind untuk event nasional dan kegiatan operasional satuan.",
      url: "https://wa.me/6281525823503?text=Halo%20Piket%20Mako%20Menwa%20UNJ,%20saya%20ingin%20mengajukan%20Kerjasama%20Sponsorship.",
      status: "Terbuka",
      statusClass: "bg-teal-700 text-white",
      ctaText: "Ajukan Kerjasama Sponsorship"
    },
    {
      id: 2,
      title: "Kerjasama Media Partner",
      category: "Publikasi & Humas",
      desc: "Pengajuan publikasi bersama, eksposur media sosial, dan kemitraan media partner untuk kegiatan event kepemudaan/lomba.",
      url: "https://wa.me/6281525823503?text=Halo%20Piket%20Mako%20Menwa%20UNJ,%20saya%20ingin%20mengajukan%20Kerjasama%20Media%20Partner.",
      status: "Terbuka",
      statusClass: "bg-teal-700 text-white",
      ctaText: "Ajukan Media Partner"
    },
    {
      id: 3,
      title: "Kerjasama Partnership",
      category: "Kemitraan Strategis",
      desc: "Kolaborasi strategis antar instansi perguruan tinggi, organisasi kemahasiswaan, kedinasan, maupun lembaga pemerintah.",
      url: "https://wa.me/6281525823503?text=Halo%20Piket%20Mako%20Menwa%20UNJ,%20saya%20ingin%20mengajukan%20Kerjasama%20Partnership.",
      status: "Terbuka",
      statusClass: "bg-teal-700 text-white",
      ctaText: "Ajukan Kerjasama Partnership"
    },
    {
      id: 4,
      title: "Kerjasama Kegiatan",
      category: "Giat Kolaborasi",
      desc: "Kolaborasi penyelenggaraan acara bersama, bakti sosial kemanusiaan, pengabdian masyarakat terpadu, & latihan gabungan.",
      url: "https://wa.me/6281525823503?text=Halo%20Piket%20Mako%20Menwa%20UNJ,%20saya%20ingin%20mengajukan%20Kerjasama%20Kegiatan.",
      status: "Terbuka",
      statusClass: "bg-teal-700 text-white",
      ctaText: "Ajukan Kerjasama Kegiatan"
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen pb-32 font-sans flex-grow">
      <RevealOnScroll className="bg-gradient-to-r from-slate-950 via-[#00383b] to-[#006569] pt-32 pb-48 px-4 text-center relative shadow-2xl">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#006569] text-[#FFDD00] rounded-full font-black text-xs uppercase tracking-widest mb-4 border border-[#FFDD00]/30">
            <FileText size={16} /> Portal Layanan Terpadu
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4">Administrasi Umum</h2>
          <p className="text-[#FFDD00] text-lg md:text-xl font-bold max-w-3xl mx-auto">
            Portal Resmi Pendaftaran, Permohonan Layanan Satuan, & Kerjasama Strategis
          </p>
        </div>
      </RevealOnScroll>

      <div className="max-w-7xl mx-auto px-4 -mt-32 relative z-20 space-y-12">
        <div className="flex flex-wrap justify-center gap-3 bg-white/95 backdrop-blur-md p-2.5 rounded-full border border-slate-200 shadow-xl w-fit mx-auto">
          <button 
            onClick={() => setActiveSubTab('pendaftaran')} 
            className={`px-6 py-3.5 rounded-full font-black text-xs md:text-sm uppercase tracking-wider transition-all duration-300 flex items-center gap-2 ${
              activeSubTab === 'pendaftaran' ? 'bg-[#006569] text-[#FFDD00] shadow-lg shadow-[#006569]/40 scale-105' : 'text-slate-600 hover:text-[#006569]'
            }`}
          >
            <Award size={16} /> 1. Pendaftaran
          </button>
          <button 
            onClick={() => setActiveSubTab('permohonan')} 
            className={`px-6 py-3.5 rounded-full font-black text-xs md:text-sm uppercase tracking-wider transition-all duration-300 flex items-center gap-2 ${
              activeSubTab === 'permohonan' ? 'bg-[#006569] text-[#FFDD00] shadow-lg shadow-[#006569]/40 scale-105' : 'text-slate-600 hover:text-[#006569]'
            }`}
          >
            <Briefcase size={16} /> 2. Permohonan
          </button>
          <button 
            onClick={() => setActiveSubTab('kerjasama')} 
            className={`px-6 py-3.5 rounded-full font-black text-xs md:text-sm uppercase tracking-wider transition-all duration-300 flex items-center gap-2 ${
              activeSubTab === 'kerjasama' ? 'bg-[#006569] text-[#FFDD00] shadow-lg shadow-[#006569]/40 scale-105' : 'text-slate-600 hover:text-[#006569]'
            }`}
          >
            <Users size={16} /> 3. Kerjasama
          </button>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-14 border border-slate-200">
          {activeSubTab === 'pendaftaran' && (
            <div className="space-y-6">
              <div className="text-center max-w-2xl mx-auto mb-10">
                <h3 className="text-2xl md:text-3xl font-black text-slate-900">Formulir & Portal Pendaftaran</h3>
                <p className="text-slate-500 font-medium text-sm mt-2">Pilih tautan pendaftaran di bawah ini untuk menuju ke portal formulir pendaftaran resmi.</p>
              </div>
              
              <Stagger className="grid grid-cols-1 md:grid-cols-3 gap-6" step={80} from="up">
                {pendaftaranItems.map((item) => (
                  <TiltCard key={item.id} className="rounded-3xl" max={5} glare={false}>
                  <Spotlight className="rounded-3xl">
                  <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 hover:border-[#006569] hover:shadow-xl transition-all duration-300 flex flex-col justify-between group h-full">
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#006569] bg-[#006569]/10 px-3 py-1 rounded-full">
                          {item.category}
                        </span>
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${item.statusClass}`}>
                          {item.status}
                        </span>
                      </div>
                      <h4 className="text-lg font-black text-slate-900 leading-tight mb-3 group-hover:text-[#006569] transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-slate-600 text-xs font-medium leading-relaxed mb-6">
                        {item.desc}
                      </p>
                    </div>

                    <MagneticButton
                      as="a"
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-[#006569] hover:bg-[#004d50] text-[#FFDD00] font-bold py-3.5 px-4 rounded-xl shadow-md text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
                    >
                      <span>{item.ctaText}</span>
                      <ExternalLink size={14} />
                    </MagneticButton>
                  </div>
                  </Spotlight>
                  </TiltCard>
                ))}
              </Stagger>
            </div>
          )}

          {activeSubTab === 'permohonan' && (
            <div className="space-y-6">
              <div className="text-center max-w-2xl mx-auto mb-10">
                <h3 className="text-2xl md:text-3xl font-black text-slate-900">Layanan Permohonan Satuan</h3>
                <p className="text-slate-500 font-medium text-sm mt-2">Pilih jenis permohonan untuk langsung terhubung dengan layanan konfirmasi Piket Mako Menwa UNJ.</p>
              </div>

              <Stagger className="grid grid-cols-1 md:grid-cols-3 gap-6" step={80} from="up">
                {permohonanItems.map((item) => (
                  <TiltCard key={item.id} className="rounded-3xl" max={5} glare={false}>
                  <Spotlight className="rounded-3xl">
                  <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 hover:border-[#006569] hover:shadow-xl transition-all duration-300 flex flex-col justify-between group h-full">
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#006569] bg-[#006569]/10 px-3 py-1 rounded-full">
                          {item.category}
                        </span>
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${item.statusClass}`}>
                          {item.status}
                        </span>
                      </div>
                      <h4 className="text-lg font-black text-slate-900 leading-tight mb-3 group-hover:text-[#006569] transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-slate-600 text-xs font-medium leading-relaxed mb-6">
                        {item.desc}
                      </p>
                    </div>

                    <MagneticButton
                      as="a"
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-[#006569] hover:bg-[#004d50] text-[#FFDD00] font-bold py-3.5 px-4 rounded-xl shadow-md text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
                    >
                      <span>{item.ctaText}</span>
                      <ExternalLink size={14} />
                    </MagneticButton>
                  </div>
                  </Spotlight>
                  </TiltCard>
                ))}
              </Stagger>
            </div>
          )}

          {activeSubTab === 'kerjasama' && (
            <div className="space-y-6">
              <div className="text-center max-w-2xl mx-auto mb-10">
                <h3 className="text-2xl md:text-3xl font-black text-slate-900">Portal Kemitraan & Kerjasama</h3>
                <p className="text-slate-500 font-medium text-sm mt-2">Pilih opsi kerjasama di bawah ini untuk mengakses pengajuan proposal & koordinasi resmi.</p>
              </div>

              <Stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" step={80} from="up">
                {kerjasamaItems.map((item) => (
                  <TiltCard key={item.id} className="rounded-3xl" max={5} glare={false}>
                  <Spotlight className="rounded-3xl">
                  <div className="bg-slate-50 rounded-3xl p-6 border border-slate-200 hover:border-[#006569] hover:shadow-xl transition-all duration-300 flex flex-col justify-between group h-full">
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#006569] bg-[#006569]/10 px-3 py-1 rounded-full">
                          {item.category}
                        </span>
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${item.statusClass}`}>
                          {item.status}
                        </span>
                      </div>
                      <h4 className="text-lg font-black text-slate-900 leading-tight mb-3 group-hover:text-[#006569] transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-slate-600 text-xs font-medium leading-relaxed mb-6">
                        {item.desc}
                      </p>
                    </div>

                    <MagneticButton
                      as="a"
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-[#006569] hover:bg-[#004d50] text-[#FFDD00] font-bold py-3.5 px-4 rounded-xl shadow-md text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
                    >
                      <span>{item.ctaText}</span>
                      <ExternalLink size={14} />
                    </MagneticButton>
                  </div>
                  </Spotlight>
                  </TiltCard>
                ))}
              </Stagger>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Footer = ({ onOpenLogin }) => {
  return (
    <footer id="footer-kontak" className="bg-slate-950 text-slate-300 pt-20 pb-8 mt-auto relative overflow-hidden font-sans border-t-4 border-[#006569]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          <RevealOnScroll delay={100}>
            <div className="flex items-center mb-6">
              <img 
                src="logo-menwa-unj.png" 
                onError={(e) => handleImgError(e, 'MENWA UNJ', '006569', 'FFDD00')} 
                alt="Logo Menwa UNJ" 
                className="w-14 h-14 object-contain mr-4 drop-shadow-lg" 
              />
              <div>
                <h3 className="text-lg font-black text-white leading-tight">KOMANDO RESIMEN MAHASISWA</h3>
                <p className="text-xs font-black text-[#FFDD00] tracking-widest uppercase">Satuan UNJ</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed max-w-sm">
              Penyempurnaan Pengabdian dengan Ilmu Pengetahuan dan Ilmu Olah Keprajuritan. Widya Castrena Dharma Siddha.
            </p>
            <div className="flex space-x-3">
              <a href="https://wa.me/6281525823503" target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center hover:bg-emerald-600 transition-all text-white">
                <Phone size={20} />
              </a>
              <a href="https://maps.google.com/?cid=17438056564465491782" target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#006569] transition-all text-white">
                <MapPin size={20} />
              </a>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={200}>
            <h4 className="text-lg font-black text-white mb-6 uppercase tracking-wider text-[#FFDD00]">Markas Komando (Mako)</h4>
            <ul className="space-y-4 text-sm font-medium text-slate-300">
              <li className="flex items-start">
                <MapPin className="text-[#FFDD00] mr-3 shrink-0 mt-1" size={18} />
                <span>Jl. R.Mangun Muka Kampus A UNJ Gedung G R.107, Rawamangun, Pulo Gadung, Jakarta Timur 13220</span>
              </li>
              <li className="flex items-center">
                <Phone className="text-[#FFDD00] mr-3 shrink-0" size={18} />
                <span>+62 815-2582-3503 (Wakil Komandan)</span>
              </li>
              <li className="flex items-center">
                <Mail className="text-[#FFDD00] mr-3 shrink-0" size={18} />
                <span>unjmenwa@gmail.com</span>
              </li>
            </ul>
          </RevealOnScroll>

          <RevealOnScroll delay={300} className="bg-white/5 p-8 rounded-3xl border border-white/10 text-center">
            <Shield size={36} className="text-[#FFDD00] mx-auto mb-4" />
            <p className="font-bold text-slate-200 italic mb-4 text-sm leading-relaxed">
              "Widya Castrena Dharma Siddha"
            </p>
            <span className="text-xs font-black text-[#FFDD00] uppercase tracking-widest">Semboyan Resimen Mahasiswa</span>
          </RevealOnScroll>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/10 text-xs text-slate-400 font-semibold">
          <p>© 2026 Komando Resimen Mahasiswa Satuan Universitas Negeri Jakarta.</p>
          <button onClick={onOpenLogin} className="mt-4 md:mt-0 flex items-center gap-2 text-slate-300 hover:text-[#FFDD00] bg-white/10 px-4 py-2 rounded-full transition-colors">
            <Lock size={14} /> Akses Anggota Mako
          </button>
        </div>
      </div>
    </footer>
  );
};

function MainApp() {
  const [activeTab, setActiveTab] = useState('beranda');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleQuickSearch = (tabId) => {
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800 selection:bg-[#006569] selection:text-[#FFDD00]">
      <MotionStyles />
      <ScrollProgress />

      <Navigation 
        activeTab={activeTab} 
        handleQuickSearch={handleQuickSearch} 
        isMobileMenuOpen={isMobileMenuOpen} 
        setIsMobileMenuOpen={setIsMobileMenuOpen} 
      />

      <main className="flex-grow flex flex-col">
        <TabSwitch tabKey={activeTab}>
          {activeTab === 'beranda' && <BerandaTab />}
          {activeTab === 'struktur' && <StrukturOrganisasiTab onNavigate={handleQuickSearch} />}
          {activeTab === 'pendidikan' && <PendidikanTab />}
          {activeTab === 'mako' && <MakoTab />}
          {activeTab === 'administrasi' && <AdministrasiUmumTab />}
        </TabSwitch>
      </main>

      <Footer onOpenLogin={() => setIsLoginModalOpen(true)} />

      <LiveChatWidget />

      {isLoginModalOpen && <LoginModal onClose={() => setIsLoginModalOpen(false)} />}
    </div>
  );
}

// Halaman sub-web /kc — placeholder, isi konten menyusul
const KcPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 font-sans text-slate-100">
      <div className="flex-grow flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFDD00] text-slate-950 rounded-full font-black text-xs uppercase tracking-widest mb-8 shadow-lg shadow-[#FFDD00]/20">
          <Trophy size={16} />
          <span>Ksatria Cendekia VIII • 2026</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">
          Halaman ini sedang <span className="text-[#FFDD00]">disiapkan</span>
        </h1>
        <p className="text-slate-400 max-w-xl mb-10 text-sm md:text-base">
          Info lengkap Lomba Nasional Ksatria Cendekia VIII akan tampil di sini. Sementara ini masih placeholder — konten menyusul.
        </p>

        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-[#FFDD00] hover:bg-yellow-400 text-[#00383b] font-black px-6 py-3.5 rounded-xl shadow-xl hover:-translate-y-0.5 transition-all text-sm uppercase tracking-wider"
        >
          <ChevronLeft size={18} />
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainApp />} />
      <Route path="/kc" element={<KcPage />} />
    </Routes>
  );
}