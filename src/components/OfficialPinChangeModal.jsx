import React, { useState } from 'react';
import { KeyRound, Lock, CheckCircle2, AlertTriangle, Eye, EyeOff, X, RefreshCw } from 'lucide-react';
import { setOfficialSecurityPin } from '../firebase.js';

export function OfficialPinChangeModal({
  isOpen,
  onClose,
  portalData,
  activeSlug,
  onPinChanged,
  hasAdminAccess,
}) {
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPins, setShowPins] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Cek PIN lama (kecuali jika admin bypass)
    const currentPin = String(portalData?.securityPin || '').trim();
    if (currentPin && !hasAdminAccess) {
      if (oldPin.trim() !== currentPin) {
        setErrorMsg('PIN Lama tidak sesuai.');
        return;
      }
    }

    const cleanNewPin = newPin.trim();
    if (cleanNewPin.length !== 6 || !/^[0-9]{6}$/.test(cleanNewPin)) {
      setErrorMsg('PIN Baru wajib tepat 6 angka numerik (0-9).');
      return;
    }

    if (cleanNewPin !== confirmPin.trim()) {
      setErrorMsg('Konfirmasi PIN tidak cocok dengan PIN Baru.');
      return;
    }

    setLoading(true);
    try {
      await setOfficialSecurityPin(
        activeSlug,
        cleanNewPin,
        hasAdminAccess ? 'Mako Admin Override' : 'Official Kontingen'
      );
      if (typeof onPinChanged === 'function') {
        onPinChanged(cleanNewPin);
      }
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Gagal mengubah PIN Keamanan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in font-sans">
      <div className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200 overflow-hidden text-slate-900">
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <KeyRound size={20} />
            </div>
            <div>
              <h3 className="text-base font-black text-[#092D32]">
                Ganti PIN Keamanan Official
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                {portalData?.schoolName || 'Kontingen Sekolah'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mt-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertTriangle size={16} className="text-rose-600 shrink-0" />
            <span className="font-bold">{errorMsg}</span>
          </div>
        )}

        {/* Form Ganti PIN */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* PIN Lama */}
          {portalData?.securityPin && !hasAdminAccess && (
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1">
                PIN LAMA (6 DIGIT)
              </label>
              <input
                type={showPins ? 'text' : 'password'}
                inputMode="numeric"
                maxLength={6}
                value={oldPin}
                onChange={(e) => setOldPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="••••••"
                className="w-full py-2.5 px-3.5 rounded-xl border border-slate-300 font-mono text-center font-black tracking-widest text-base focus:border-[#006569] focus:outline-none bg-slate-50 focus:bg-white"
              />
            </div>
          )}

          {/* PIN Baru */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-700">
                PIN BARU (6 DIGIT)
              </label>
              <button
                type="button"
                onClick={() => setShowPins(!showPins)}
                className="text-[10px] font-bold text-[#006569] hover:underline flex items-center gap-1 cursor-pointer"
              >
                {showPins ? <EyeOff size={12} /> : <Eye size={12} />}
                <span>{showPins ? 'Sembunyikan' : 'Tampilkan'}</span>
              </button>
            </div>
            <input
              type={showPins ? 'text' : 'password'}
              inputMode="numeric"
              maxLength={6}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="••••••"
              className="w-full py-2.5 px-3.5 rounded-xl border border-slate-300 font-mono text-center font-black tracking-widest text-base focus:border-[#006569] focus:outline-none bg-slate-50 focus:bg-white"
            />
          </div>

          {/* Konfirmasi PIN Baru */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1">
              ULANGI PIN BARU
            </label>
            <input
              type={showPins ? 'text' : 'password'}
              inputMode="numeric"
              maxLength={6}
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="••••••"
              className="w-full py-2.5 px-3.5 rounded-xl border border-slate-300 font-mono text-center font-black tracking-widest text-base focus:border-[#006569] focus:outline-none bg-slate-50 focus:bg-white"
            />
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer text-center"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || newPin.length !== 6 || confirmPin.length !== 6}
              className="flex-1 py-3 px-4 rounded-xl bg-[#006569] hover:bg-[#092D32] text-[#FFDD00] font-black text-xs uppercase tracking-wider transition cursor-pointer shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>Simpan PIN Baru</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default OfficialPinChangeModal;
