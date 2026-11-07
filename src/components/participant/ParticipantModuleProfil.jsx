import React from 'react';
import {
  Building2,
  Save,
  Loader2,
  Upload,
  Lock,
  AlertCircle,
  Check,
} from 'lucide-react';

export function ParticipantModuleProfil({
  handleProfileSubmit,
  profileForm = {},
  setProfileForm,
  profileErrors = {},
  setProfileErrors,
  handleLogoUpload,
  savingProfile,
  isGuestMode,
  canEdit = true,
  progress = {},
  profileFieldRefs,
}) {
  return (
              <div className="neu-card rounded-3xl p-6 sm:p-8 space-y-6 animate-fade-in">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/70 pb-4">
                  <div>
                    <span className="text-[10px] font-mono font-black uppercase tracking-widest text-[#006569] block">
                      MODUL 01 · IDENTITAS KONTINGEN SEKOLAH
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-[#092D32]">
                      Profil Instansi Sekolah
                    </h2>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      Nama dan logo sekolah pada modul ini otomatis terdeteksi pada Kartu ID Pasukan dan Buku Pasukan A4.
                    </p>
                  </div>
                  <span className="font-mono text-xs font-black text-[#059669]">
                    Kelengkapan: {progress?.profilPct || 0}%
                  </span>
                </div>

                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  {/* a. Logo Sekolah */}
                  <div
                    ref={(el) => {
                      if (profileFieldRefs?.current) {
                        profileFieldRefs.current.logoDataUrl = el;
                      }
                    }}
                    className={`rounded-2xl border-2 border-dashed p-5 transition ${
                      profileErrors.logoDataUrl
                        ? 'border-[#E11D48] bg-rose-50/50'
                        : 'border-[#006569]/30 bg-[#F5F8F6]'
                    }`}
                  >
                    <label className="block text-xs font-black uppercase tracking-wider text-[#092D32] mb-1">
                      a. Logo Sekolah (Wajib .jpg, .png, .svg, .webp · Maksimal 100 KB) *
                    </label>
                    <div className="flex flex-wrap items-center gap-5 mt-3">
                      <div className="w-24 h-24 rounded-2xl neu-logo-tile flex items-center justify-center overflow-hidden p-2 shrink-0">
                        {profileForm.logoDataUrl ? (
                          <img
                            src={profileForm.logoDataUrl}
                            alt="Logo Sekolah"
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <Building2 size={32} className="text-slate-300" />
                        )}
                      </div>
                      <div className="space-y-2">
                        {canEdit ? (
                          <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl neu-btn-primary text-[#FFDD00] font-black text-xs uppercase tracking-wider cursor-pointer transition">
                            <Upload size={14} />
                            <span>Pilih File Logo Sekolah</span>
                            <input
                              type="file"
                              accept=".jpg,.jpeg,.png,.svg,.webp,image/jpeg,image/png,image/svg+xml,image/webp"
                              onChange={handleLogoUpload}
                              className="hidden"
                            />
                          </label>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl neu-inset text-slate-500 font-bold text-xs select-none">
                            <Lock size={13} /> Logo Terkunci (Mode Tamu)
                          </span>
                        )}
                        {profileForm.logoFileName && (
                          <p className="text-xs font-bold text-[#059669]">
                            ✓ {profileForm.logoFileName} ({profileForm.logoSizeKb} KB)
                          </p>
                        )}
                        {profileErrors.logoDataUrl && (
                          <p className="text-xs font-bold text-[#E11D48] flex items-center gap-1">
                            <AlertCircle size={14} /> {profileErrors.logoDataUrl}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* b. Nama Sekolah */}
                  <div
                    ref={(el) => {
                      if (profileFieldRefs?.current) {
                        profileFieldRefs.current.schoolName = el;
                      }
                    }}
                  >
                    <label className="block text-xs font-black uppercase tracking-wider text-[#092D32] mb-1.5">
                      b. Nama Sekolah *
                    </label>
                    <div
                      className={`neu-inset rounded-2xl px-4 py-3 ${
                        profileErrors.schoolName ? 'ring-2 ring-[#E11D48]/30' : ''
                      }`}
                    >
                      <input
                        type="text"
                        value={profileForm.schoolName}
                        onChange={(e) => {
                          setProfileForm({ ...profileForm, schoolName: e.target.value });
                          if (profileErrors.schoolName) {
                            setProfileErrors({ ...profileErrors, schoolName: '' });
                          }
                        }}
                        disabled={!canEdit}
                        readOnly={!canEdit}
                        style={{ color: '#020617' }}
                        placeholder="Contoh: SMA Negeri 1 Jakarta"
                        className={`w-full bg-transparent text-sm font-bold text-slate-950 focus:outline-none ${
                          !canEdit ? 'opacity-70 cursor-not-allowed' : ''
                        }`}
                      />
                    </div>
                    {profileErrors.schoolName && (
                      <p className="mt-1 text-xs font-bold text-[#E11D48]">
                        {profileErrors.schoolName}
                      </p>
                    )}
                  </div>

                  {/* c. Alamat Sekolah (6 Sub-Field Terstruktur) */}
                  <div className="space-y-4 pt-2 border-t border-slate-200/70">
                    <h3 className="text-xs font-black uppercase tracking-wider text-[#092D32]">
                      c. Alamat Lengkap Sekolah *
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { key: 'jalan', label: 'Nama Jalan', placeholder: 'Jl. Budi Utomo No. 7' },
                        { key: 'rtRw', label: 'RT / RW', placeholder: 'RT 004 / RW 008' },
                        { key: 'kelurahan', label: 'Kelurahan', placeholder: 'Pasar Baru' },
                        { key: 'kecamatan', label: 'Kecamatan', placeholder: 'Sawah Besar' },
                        { key: 'kabupatenKota', label: 'Kabupaten / Kota', placeholder: 'Kota Jakarta Pusat' },
                        { key: 'provinsi', label: 'Provinsi', placeholder: 'DKI Jakarta' },
                      ].map((field) => (
                        <div
                          key={field.key}
                          ref={(el) => {
                            if (profileFieldRefs?.current) {
                              profileFieldRefs.current[field.key] = el;
                            }
                          }}
                        >
                          <label className="block text-xs font-bold text-[#092D32] mb-1">
                            {field.label} *
                          </label>
                          <div
                            className={`neu-inset rounded-xl px-3.5 py-2.5 ${
                              profileErrors[field.key] ? 'ring-2 ring-[#E11D48]/30' : ''
                            }`}
                          >
                            <input
                              type="text"
                              value={profileForm[field.key]}
                              onChange={(e) => {
                                setProfileForm({
                                  ...profileForm,
                                  [field.key]: e.target.value,
                                });
                                if (profileErrors[field.key]) {
                                  setProfileErrors({ ...profileErrors, [field.key]: '' });
                                }
                              }}
                              disabled={!canEdit}
                              readOnly={!canEdit}
                              style={{ color: '#020617' }}
                              placeholder={field.placeholder}
                              className={`w-full bg-transparent text-xs sm:text-sm font-bold text-slate-950 focus:outline-none ${
                                !canEdit ? 'opacity-70 cursor-not-allowed' : ''
                              }`}
                            />
                          </div>
                          {profileErrors[field.key] && (
                            <p className="mt-1 text-[11px] font-bold text-[#E11D48]">
                              {profileErrors[field.key]}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {canEdit && (
                    <div className="pt-4 flex justify-end">
                      <button
                        type="submit"
                        disabled={savingProfile}
                        className="px-6 py-3.5 rounded-2xl neu-btn-primary text-[#FFDD00] font-black text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-2"
                      >
                        <Check size={16} />
                        <span>{savingProfile ? 'Menyimpan Profil...' : 'Simpan Profil Sekolah'}</span>
                      </button>
                    </div>
                  )}
                </form>
              </div>
  );
}
