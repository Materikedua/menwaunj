import React, { useState, useRef } from 'react';
import {
  X,
  CreditCard,
  Printer,
  Shield,
  ShieldCheck,
  Sparkles,
  QrCode,
  Download,
  Rotate3D,
  User,
  Check,
  Building,
} from 'lucide-react';
import { useAuth } from '../lib/authContext.jsx';
import { playTactileClick } from '../lib/tactileAudio.js';

export function TacticalKTACardModal({ isOpen, onClose }) {
  const { user, profile } = useAuth();
  const [isFlipped, setIsFlipped] = useState(false);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });

  // Data Anggota (Bisa diedit preview jika diinginkan)
  const [cardName, setCardName] = useState(() => {
    return profile?.displayName || user?.displayName || 'KSATRIA MENWA UNJ';
  });
  const [cardNbp, setCardNbp] = useState(() => {
    return profile?.nbp || 'NBP.22020742263';
  });
  const [cardRole, setCardRole] = useState(() => {
    return profile?.role || 'Prajurit Satuan Menwa UNJ';
  });
  const [cardFaculty, setCardFaculty] = useState(() => {
    return profile?.institution || 'Universitas Negeri Jakarta';
  });

  const cardRef = useRef(null);

  if (!isOpen) return null;

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 14;
    setTilt({ rotateX, rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0 });
  };

  const handlePrint = () => {
    playTactileClick('press');
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-3xl neu-card bg-[#F5F8F6] p-5 sm:p-8 text-[#092D32] shadow-2xl my-auto space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tombol Tutup */}
        <button
          type="button"
          onClick={() => {
            playTactileClick('release');
            onClose();
          }}
          aria-label="Tutup modal KTA"
          className="absolute top-5 right-5 p-2 rounded-full neu-btn text-slate-600 hover:text-rose-600 transition cursor-pointer shadow-sm"
        >
          <X size={18} />
        </button>

        {/* Header Modal */}
        <div className="flex items-center gap-3 border-b border-slate-200/80 pb-4 pr-12">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#006569] to-[#092D32] text-[#FFDD00] flex items-center justify-center font-black shadow-md shrink-0">
            <CreditCard size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-100 text-[#006569] border border-teal-200">
                IDENTITAS DIGITAL RESMI
              </span>
              <span className="text-[11px] font-mono text-slate-500 font-bold">
                E-KTA MENWA SATUAN UNJ
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#092D32] mt-0.5">
              Kartu Tanda Anggota (KTA) Digital
            </h2>
          </div>
        </div>

        {/* Panggung Kartu 3D Holografik dengan Efek Tilt Mouse */}
        <div className="flex flex-col items-center justify-center py-4 select-none">
          <div
            style={{ perspective: '1200px' }}
            className="w-full max-w-md aspect-[1.586/1] cursor-pointer"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={() => {
              playTactileClick('click');
              setIsFlipped((prev) => !prev);
            }}
          >
            <div
              ref={cardRef}
              style={{
                transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) ${
                  isFlipped ? 'rotateY(180deg)' : ''
                }`,
                transformStyle: 'preserve-3d',
                transition: 'transform 0.15s ease-out',
              }}
              className="relative w-full h-full rounded-2xl shadow-2xl transition-shadow duration-300"
            >
              {/* SISI DEPAN (FRONT) */}
              <div
                style={{ backfaceVisibility: 'hidden' }}
                className={`absolute inset-0 rounded-2xl overflow-hidden border border-white/40 p-4 sm:p-5 flex flex-col justify-between text-white ${
                  isFlipped ? 'pointer-events-none opacity-0' : 'opacity-100'
                }`}
              >
                {/* Background Gradien Militer Jayakarta */}
                <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#004f53] via-[#092D32] to-[#021B25]" />
                <div className="absolute inset-0 -z-10 opacity-20 bg-[radial-gradient(circle_at_70%_30%,#FFDD00_0%,transparent_60%)]" />

                {/* Holographic Shimmer Ribbon Overlay */}
                <div
                  style={{
                    background:
                      'linear-gradient(135deg, transparent 20%, rgba(255,221,0,0.18) 45%, rgba(255,255,255,0.3) 50%, rgba(20,184,166,0.2) 55%, transparent 75%)',
                    transform: `translate(${tilt.rotateY * 4}px, ${tilt.rotateX * 4}px)`,
                  }}
                  className="absolute inset-0 pointer-events-none transition-transform duration-75"
                />

                {/* KOP KTA */}
                <div className="flex items-center justify-between border-b border-white/20 pb-2">
                  <div className="flex items-center gap-2">
                    <img
                      src="/logo-menwa-unj.png"
                      alt="Logo Menwa UNJ"
                      className="w-10 h-10 object-contain drop-shadow"
                    />
                    <div>
                      <div className="text-[9px] font-black tracking-widest text-[#FFDD00] uppercase">
                        RESIMEN MAHASISWA JAYAKARTA
                      </div>
                      <div className="text-xs font-black tracking-tight text-white leading-none">
                        SATUAN UNIVERSITAS NEGERI JAKARTA
                      </div>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-[#FFDD00]">
                    <ShieldCheck size={18} />
                  </div>
                </div>

                {/* Body KTA: Foto, Nama & Info Prajurit */}
                <div className="flex items-center gap-3.5 my-auto">
                  <div className="w-16 h-20 sm:w-20 sm:h-24 rounded-xl border-2 border-[#FFDD00] bg-slate-900 overflow-hidden shrink-0 shadow-md flex items-center justify-center">
                    {profile?.photoURL || user?.photoURL ? (
                      <img
                        src={profile.photoURL || user.photoURL}
                        alt={cardName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-[#FFDD00] p-1 text-center">
                        <User size={28} />
                        <span className="text-[9px] font-mono font-bold mt-1">FOTO RESMI</span>
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-teal-300 font-bold block">
                      KARTU TANDA ANGGOTA
                    </span>
                    <h3 className="text-sm sm:text-base font-black truncate text-white leading-tight">
                      {cardName}
                    </h3>
                    <div className="font-mono text-xs font-black text-[#FFDD00]">
                      {cardNbp}
                    </div>
                    <div className="text-[11px] font-bold text-slate-300 truncate">
                      {cardRole}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {cardFaculty}
                    </div>
                  </div>
                </div>

                {/* Footer KTA: Barcode & Status Kehormatan */}
                <div className="flex items-end justify-between pt-2 border-t border-white/15 text-[9px] font-mono">
                  <div>
                    <span className="text-slate-400 block text-[8px]">KODE KEHORMATAN</span>
                    <span className="font-bold text-[#FFDD00]">WIDYA CASTRENA DHARMA SIDDHA</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[8px]">BERLAKU S/D</span>
                    <span className="font-bold text-white">2026 - 2028</span>
                  </div>
                </div>
              </div>

              {/* SISI BELAKANG (BACK) */}
              <div
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }}
                className={`absolute inset-0 rounded-2xl overflow-hidden border border-white/40 p-4 sm:p-5 flex flex-col justify-between text-white bg-gradient-to-br from-[#021B25] via-[#092D32] to-[#004f53] ${
                  !isFlipped ? 'pointer-events-none opacity-0' : 'opacity-100'
                }`}
              >
                <div className="flex items-center justify-between border-b border-white/20 pb-1.5">
                  <span className="text-[9px] font-black tracking-widest text-[#FFDD00]">
                    PANCA DHARMA SATYA RESIMEN MAHASISWA
                  </span>
                  <span className="text-[10px] font-mono text-slate-300">01-05</span>
                </div>

                <div className="space-y-1 text-[8.5px] sm:text-[9.5px] leading-snug text-slate-200">
                  <p>1. Bertakwa kepada Tuhan Yang Maha Esa dan membela kejujuran serta kebenaran.</p>
                  <p>2. Menjunjung tinggi kehormatan dan martabat Resimen Mahasiswa Indonesia.</p>
                  <p>3. Mengamalkan ilmu pengetahuan bagi kesejahteraan nusa dan bangsa.</p>
                  <p>4. Senantiasa memelihara disiplin, kesiapsiagaan, dan keutuhan satuan.</p>
                  <p>5. Memegang teguh jiwa korsa dan persatuan ksatria Indonesia.</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/20">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-white p-0.5 shrink-0">
                      <img src="/logo-menwa-unj.png" alt="" className="w-full h-full object-contain" />
                    </div>
                    <div className="text-[8px] text-slate-300">
                      Mako Menwa UNJ Gedung G R.107<br />Kampus A UNJ Rawamangun Jakarta
                    </div>
                  </div>
                  <div className="p-1 rounded bg-white text-slate-950">
                    <QrCode size={28} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p className="mt-3 text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
            <Rotate3D size={14} className="text-[#006569]" />
            <span>Klik kartu untuk membalik (Front / Back), gerakkan kursor untuk efek tilt hologram</span>
          </p>
        </div>

        {/* Input Edit Data Kartu (Bisa Disesuaikan Oleh Pengguna) */}
        <div className="rounded-2xl p-4 bg-white border border-slate-200 space-y-3">
          <span className="text-xs font-black uppercase tracking-wider text-[#006569]">
            Sesuaikan Data KTA Preview:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold">
            <div>
              <label className="text-slate-600 block mb-1">Nama Anggota:</label>
              <input
                type="text"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                style={{ color: '#000000', backgroundColor: '#FFFFFF' }}
                className="w-full rounded-xl border border-slate-300 p-2 text-black outline-none focus:border-[#006569]"
              />
            </div>
            <div>
              <label className="text-slate-600 block mb-1">Nomor Induk / NBP:</label>
              <input
                type="text"
                value={cardNbp}
                onChange={(e) => setCardNbp(e.target.value)}
                style={{ color: '#000000', backgroundColor: '#FFFFFF' }}
                className="w-full rounded-xl border border-slate-300 p-2 text-black outline-none focus:border-[#006569]"
              />
            </div>
            <div>
              <label className="text-slate-600 block mb-1">Jabatan / Satuan:</label>
              <input
                type="text"
                value={cardRole}
                onChange={(e) => setCardRole(e.target.value)}
                style={{ color: '#000000', backgroundColor: '#FFFFFF' }}
                className="w-full rounded-xl border border-slate-300 p-2 text-black outline-none focus:border-[#006569]"
              />
            </div>
            <div>
              <label className="text-slate-600 block mb-1">Asal Lembaga / Fakultas:</label>
              <input
                type="text"
                value={cardFaculty}
                onChange={(e) => setCardFaculty(e.target.value)}
                style={{ color: '#000000', backgroundColor: '#FFFFFF' }}
                className="w-full rounded-xl border border-slate-300 p-2 text-black outline-none focus:border-[#006569]"
              />
            </div>
          </div>
        </div>

        {/* Tombol Aksi */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-200">
          <button
            type="button"
            onClick={handlePrint}
            className="neu-btn-strong-blue rounded-full py-2.5 px-6 text-xs font-black flex items-center gap-1.5 shadow-sm"
          >
            <Printer size={15} />
            <span>Cetak Kartu Fisik (A4/PVC)</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="neu-btn rounded-full py-2.5 px-5 text-xs font-bold text-slate-700"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

export default TacticalKTACardModal;
