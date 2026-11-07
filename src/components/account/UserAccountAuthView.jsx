import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, Check, ArrowRight, Phone, ShieldCheck } from 'lucide-react';
import { playTactileClick } from '../../lib/tactileAudio.js';
import { navigate } from '../../lib/router.jsx';

export function UserAccountAuthView({
  authMode,
  setAuthMode,
  email,
  setEmail,
  password,
  setPassword,
  fullName,
  setFullName,
  showPassword,
  setShowPassword,
  rememberMe,
  setRememberMe,
  submitting,
  handleEmailAuth,
  handlePasswordReset,
  handleGoogleLogin,
  setError,
  setSuccess,
  onClose,
}) {
  return (
    <div className="space-y-5 text-center">
      {/* Tile Logo Glassmorphic di Bagian Atas */}
      <div className="mx-auto w-24 h-24 rounded-3xl neu-logo-tile p-3.5 flex items-center justify-center relative overflow-hidden">
        <div className="pointer-events-none absolute -top-6 -left-6 w-16 h-16 bg-white/80 rounded-full blur-md" />
        <img
          src="/logo-menwa-unj.png"
          alt="Logo Menwa UNJ"
          className="w-full h-full object-contain relative z-10 drop-shadow-sm"
        />
      </div>

      {/* Tipografi Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-[#092D32] tracking-tight">
          {authMode === 'register'
            ? 'Buat Akun Baru'
            : authMode === 'forgot'
            ? 'Pemulihan Sandi'
            : 'Selamat Datang'}
        </h2>
        <p className="mt-1 text-xs text-slate-500 font-semibold">
          {authMode === 'register'
            ? 'Daftarkan identitas sivitas atau peserta untuk melanjutkan'
            : authMode === 'forgot'
            ? 'Masukkan email terdaftar untuk menerima tautan reset'
            : 'Masukkan kredensial akun untuk melanjutkan'}
        </p>
      </div>

      {/* Switcher Masuk / Daftar */}
      {authMode !== 'forgot' ? (
        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-full neu-pill-bar">
          <button
            type="button"
            onClick={() => {
              playTactileClick('pill');
              setAuthMode('login');
              setError('');
            }}
            className={authMode === 'login' ? 'neu-pill-tab-dark justify-center' : 'neu-pill-tab justify-center'}
          >
            Masuk Akun
          </button>
          <button
            type="button"
            onClick={() => {
              playTactileClick('pill');
              setAuthMode('register');
              setError('');
            }}
            className={authMode === 'register' ? 'neu-pill-tab-dark justify-center' : 'neu-pill-tab justify-center'}
          >
            Daftar Baru
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-slate-500">Reset Kata Sandi</span>
          <button
            type="button"
            onClick={() => {
              setAuthMode('login');
              setError('');
            }}
            className="text-xs font-black text-[#006569] hover:underline cursor-pointer"
          >
            ← Kembali ke Login
          </button>
        </div>
      )}

      {/* FORM PEMULIHAN SANDI */}
      {authMode === 'forgot' ? (
        <form onSubmit={handlePasswordReset} className="space-y-4 text-left">
          <div className="neu-inset rounded-2xl px-4 py-3.5 flex items-center gap-3">
            <Mail size={18} className="text-[#006569] shrink-0" />
            <input
              type="email"
              required
              placeholder="Alamat Email Terdaftar"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ color: '#020617' }}
              className="w-full bg-transparent text-slate-950 font-bold text-sm sm:text-base placeholder:text-slate-400 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 pl-6 pr-3.5 rounded-full neu-btn-primary bg-gradient-to-r from-[#006569] via-[#092D32] to-[#004d50] text-[#FFDD00] hover:text-white font-black text-sm tracking-wide flex items-center justify-between cursor-pointer disabled:opacity-60 shadow-lg hover:shadow-xl transition-all"
          >
            <span className="mx-auto pl-6">
              {submitting ? 'Mengirim Tautan...' : 'Kirim Tautan Reset'}
            </span>
            <span className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-[#FFDD00] shrink-0">
              <ArrowRight size={17} />
            </span>
          </button>
        </form>
      ) : (
        /* FORM LOGIN / REGISTER UTAMA */
        <form onSubmit={handleEmailAuth} className="space-y-3.5 text-left">
          {authMode === 'register' && (
            <div className="neu-inset rounded-2xl px-4 py-3.5 flex items-center gap-3">
              <User size={18} className="text-[#006569] shrink-0" />
              <input
                type="text"
                required
                placeholder="Nama Lengkap Sesuai Identitas"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={{ color: '#020617' }}
                className="w-full bg-transparent text-slate-950 font-bold text-sm sm:text-base placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          )}

          <div className="neu-inset rounded-2xl px-4 py-3.5 flex items-center gap-3">
            <Mail size={18} className="text-[#006569] shrink-0" />
            <input
              type="email"
              required
              placeholder="Email atau Akun Sivitas"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ color: '#020617' }}
              className="w-full bg-transparent text-slate-950 font-bold text-sm sm:text-base placeholder:text-slate-400 focus:outline-none"
            />
          </div>

          <div className="neu-inset rounded-2xl px-4 py-3.5 flex items-center gap-3">
            <Lock size={18} className="text-[#006569] shrink-0" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              placeholder="Kata Sandi"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ color: '#020617' }}
              className="w-full bg-transparent text-slate-950 font-bold text-sm sm:text-base placeholder:text-slate-400 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="text-slate-500 hover:text-[#006569] p-1 cursor-pointer"
              aria-label="Tampilkan atau sembunyikan kata sandi"
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>

          {/* Baris Ingat Saya & Lupa Kata Sandi */}
          <div className="flex items-center justify-between px-1 pt-0.5 text-xs">
            <label className="inline-flex items-center gap-2 cursor-pointer select-none font-bold text-slate-700">
              <button
                type="button"
                role="checkbox"
                aria-checked={rememberMe}
                onClick={() => setRememberMe((prev) => !prev)}
                className={`w-5 h-5 rounded-md flex items-center justify-center transition cursor-pointer ${
                  rememberMe
                    ? 'bg-[#006569] text-[#FFDD00] shadow-xs'
                    : 'neu-inset text-transparent'
                }`}
              >
                <Check size={13} className="stroke-[3]" />
              </button>
              <span>Ingat Saya</span>
            </label>

            {authMode === 'login' && (
              <button
                type="button"
                onClick={() => {
                  setAuthMode('forgot');
                  setError('');
                  setSuccess('');
                }}
                className="font-bold text-[#006569] hover:underline cursor-pointer"
              >
                Lupa Kata Sandi?
              </button>
            )}
          </div>

          {/* Tombol CTA Login Utama */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 pl-6 pr-3.5 rounded-full neu-btn-primary bg-gradient-to-r from-[#006569] via-[#092D32] to-[#004d50] text-[#FFDD00] hover:text-white font-black text-sm sm:text-base tracking-wide flex items-center justify-between cursor-pointer disabled:opacity-60 shadow-lg hover:shadow-xl transition-all mt-2"
          >
            <span className="mx-auto pl-6">
              {submitting
                ? 'Memproses...'
                : authMode === 'login'
                ? 'Login'
                : 'Daftar & Masuk'}
            </span>
            <span className="w-9 h-9 rounded-full bg-white/15 border border-white/25 flex items-center justify-center text-[#FFDD00] shrink-0 shadow-inner">
              <ArrowRight size={17} />
            </span>
          </button>
        </form>
      )}

      {/* Pemisah "ATAU MASUK MELALUI" */}
      <div className="flex items-center gap-3 pt-1">
        <div className="h-[1.5px] flex-1 bg-gradient-to-r from-transparent via-slate-300/80 to-slate-300/80" />
        <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
          ATAU MASUK MELALUI
        </span>
        <div className="h-[1.5px] flex-1 bg-gradient-to-l from-transparent via-slate-300/80 to-slate-300/80" />
      </div>

      {/* Deretan Tombol Sosial */}
      <div className="flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={submitting}
          title="Masuk dengan Akun Google"
          className="neu-social-btn cursor-pointer"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24Z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
            />
          </svg>
        </button>

        <button
          type="button"
          onClick={() => {
            onClose();
            navigate('/official');
          }}
          title="Portal Official WhatsApp Kontingen"
          className="neu-social-btn cursor-pointer text-[#059669]"
        >
          <Phone size={22} className="stroke-[2.4]" />
        </button>

        <button
          type="button"
          onClick={() => {
            setAuthMode(authMode === 'login' ? 'register' : 'login');
            setError('');
          }}
          title={authMode === 'login' ? 'Buat Akun Baru' : 'Masuk dengan Email'}
          className="neu-social-btn cursor-pointer text-[#006569]"
        >
          <ShieldCheck size={23} className="stroke-[2.3]" />
        </button>
      </div>

      {/* Footer Motto */}
      <div className="pt-2 text-[10px] font-black tracking-[0.22em] text-slate-400 uppercase">
        WIDYA · CASTRENA · DHARMA · SIDDHA
      </div>
    </div>
  );
}

