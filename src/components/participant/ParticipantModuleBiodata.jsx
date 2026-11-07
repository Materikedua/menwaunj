import React from 'react';
import {
  Users,
  Shield,
  Plus,
  Lock,
  Upload,
  Edit2,
  Trash2,
  CreditCard,
  Download,
  AlertCircle,
  X,
  CheckCircle2,
} from 'lucide-react';
import { TeamIdCardPreview } from './TeamIdCardPreview.jsx';

export function ParticipantModuleBiodata({
  totalPasukan,
  totalOfficial,
  openKtaViewer,
  exportOfficialZipArchive,
  isExportingZip,
  printTeamRosterPdf,
  isGuestMode,
  showPasukanForm,
  setShowPasukanForm,
  editingPasukanId,
  handleCancelPasukanForm,
  handleSavePasukan,
  pasukanForm,
  setPasukanForm,
  pasukanErrors,
  handlePasukanPhotoUpload,
  portalData,
  handleEditPasukan,
  handleDeletePasukan,
  showOfficialForm,
  setShowOfficialForm,
  editingOfficialId,
  handleCancelOfficialForm,
  handleSaveOfficial,
  officialForm,
  setOfficialForm,
  officialErrors,
  handleOfficialPhotoUpload,
  handleEditOfficial,
  handleDeleteOfficial,
  detectedSchoolName,
}) {
  return (
              <div className="space-y-6 animate-fade-in">
                <div className="neu-card rounded-3xl p-6 sm:p-8 space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-mono font-black uppercase tracking-widest text-[#006569] block">
                        MODUL 03 · KUOTA TERKUNCI 20 PERSONEL (18 PASUKAN + 2 OFFICIAL)
                      </span>
                      <h2 className="text-xl sm:text-2xl font-black text-[#092D32]">
                        Biodata Pasukan &amp; Cetak Kartu ID
                      </h2>
                      <p className="text-xs text-[#64748B] mt-0.5">
                        Asal sekolah otomatis terdeteksi:{' '}
                        <strong className="text-[#092D32]">{detectedSchoolName}</strong>
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      {canEdit && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPasukanId(null);
                              setPasukanErrors({});
                              setShowPasukanForm((prev) => !prev);
                              setShowOfficialForm(false);
                            }}
                            disabled={(portalData?.pasukanList?.length || 0) >= 18 && !showPasukanForm}
                            className="px-4 py-2.5 rounded-2xl neu-btn-primary bg-gradient-to-r from-[#006569] via-[#092D32] to-[#004d50] disabled:opacity-40 text-[#FFDD00] hover:text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer shadow-md"
                          >
                            <UserPlus size={15} />
                            <span>Tambah Pasukan ({portalData?.pasukanList?.length || 0}/18)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingOfficialId(null);
                              setOfficialErrors({});
                              setShowOfficialForm((prev) => !prev);
                              setShowPasukanForm(false);
                            }}
                            disabled={(portalData?.officialList?.length || 0) >= 2 && !showOfficialForm}
                            className="px-4 py-2.5 rounded-2xl neu-btn disabled:opacity-40 text-[#092D32] font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <Plus size={15} className="text-[#006569]" />
                            <span>Tambah Official ({portalData?.officialList?.length || 0}/2)</span>
                          </button>
                        </>
                      )}

                      <button
                        type="button"
                        onClick={handleDownloadTeamCardsPdf}
                        disabled={progress.biodataCount === 0}
                        className="px-4 py-2.5 rounded-2xl neu-btn-gold disabled:opacity-40 text-[#092D32] font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Printer size={15} />
                        <span>Cetak 20 ID Card (PDF)</span>
                      </button>
                    </div>
                  </div>

                  <div className="rounded-2xl neu-card-sm p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-[#092D32]">
                        Progres Pengisian Biodata Kontingen ({progress.biodataCount} / 20 Data)
                      </span>
                      <span className="font-mono font-black text-[#059669] tabular-nums">
                        {progress.biodataPct}% Selesai
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full neu-inset overflow-hidden p-0.5">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${progress.biodataPct}%`,
                          background: 'linear-gradient(90deg, #006569 0%, #059669 100%)',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* FORM TAMBAH / EDIT PASUKAN */}
                {canEdit && showPasukanForm && (
                  <div className="neu-card rounded-3xl p-6 sm:p-8 space-y-6 animate-fade-in">
                    <div className="flex items-center justify-between border-b border-slate-200/70 pb-3">
                      <h3 className="text-base sm:text-lg font-black text-[#092D32]">
                        {editingPasukanId ? 'Edit Biodata Pasukan' : 'Form Tambah Pasukan Baru'}
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          setShowPasukanForm(false);
                          setEditingPasukanId(null);
                        }}
                        className="p-2 rounded-2xl neu-btn text-slate-600 hover:text-slate-950 cursor-pointer"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    <form onSubmit={handleSubmitPasukan} className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div
                          ref={(el) => {
                            pasukanFieldRefs.current.photoDataUrl = el;
                          }}
                          className={`rounded-2xl border-2 border-dashed p-4 ${
                            pasukanErrors.photoDataUrl
                              ? 'border-[#E11D48] bg-rose-50/50'
                              : 'border-[#006569]/30 bg-[#F5F8F6]'
                          }`}
                        >
                          <label className="block text-xs font-black uppercase text-[#092D32] mb-1">
                            a. Foto Profil (.jpg, .png, .svg, .webp · Maks 100 KB) *
                          </label>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="w-16 h-20 rounded-xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                              {pasukanForm.photoDataUrl ? (
                                <img
                                  src={pasukanForm.photoDataUrl}
                                  alt="Preview"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Users size={22} className="text-slate-300" />
                              )}
                            </div>
                            <div className="space-y-1.5">
                              <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl neu-btn-primary bg-gradient-to-r from-[#006569] via-[#092D32] to-[#004d50] text-[#FFDD00] hover:text-white font-black text-xs uppercase cursor-pointer shadow-sm">
                                <Upload size={13} /> Pilih Foto
                                <input
                                  type="file"
                                  accept=".jpg,.jpeg,.png,.svg,.webp"
                                  onChange={handlePasukanPhotoChange}
                                  className="hidden"
                                />
                              </label>
                              {pasukanForm.photoFileName && (
                                <p className="text-[11px] font-bold text-[#059669]">
                                  ✓ {pasukanForm.photoFileName} ({pasukanForm.photoSizeKb} KB)
                                </p>
                              )}
                              {pasukanErrors.photoDataUrl && (
                                <p className="text-[11px] font-bold text-[#E11D48]">
                                  {pasukanErrors.photoDataUrl}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div
                          ref={(el) => {
                            pasukanFieldRefs.current.fullName = el;
                          }}
                        >
                          <label className="block text-xs font-black uppercase text-[#092D32] mb-1">
                            b. Nama Lengkap *
                          </label>
                          <div className="neu-inset rounded-xl px-3.5 py-2.5">
                            <input
                              type="text"
                              value={pasukanForm.fullName}
                              onChange={(e) => {
                                setPasukanForm({ ...pasukanForm, fullName: e.target.value });
                                if (pasukanErrors.fullName) {
                                  setPasukanErrors({ ...pasukanErrors, fullName: '' });
                                }
                              }}
                              style={{ color: '#020617' }}
                              placeholder="Masukkan nama lengkap anggota pasukan"
                              className="w-full bg-transparent text-sm font-bold text-slate-950 focus:outline-none"
                            />
                          </div>
                          {pasukanErrors.fullName && (
                            <p className="mt-1 text-xs font-bold text-[#E11D48]">
                              {pasukanErrors.fullName}
                            </p>
                          )}

                          <label className="block text-xs font-black uppercase text-[#092D32] mt-3 mb-1">
                            c. Asal Sekolah (Otomatis Terdeteksi)
                          </label>
                          <div className="neu-inset rounded-xl px-3.5 py-2.5 opacity-80">
                            <input
                              type="text"
                              readOnly
                              value={detectedSchoolName}
                              style={{ color: '#020617' }}
                              className="w-full bg-transparent text-xs font-bold text-slate-950 cursor-not-allowed focus:outline-none"
                            />
                          </div>
                        </div>

                        <div
                          ref={(el) => {
                            pasukanFieldRefs.current.position = el;
                          }}
                        >
                          <label className="block text-xs font-black uppercase text-[#092D32] mb-1">
                            d. Posisi Dalam Pasukan *
                          </label>
                          <div className="neu-inset rounded-xl px-3.5 py-2.5">
                            <select
                              value={pasukanForm.position}
                              onChange={(e) =>
                                setPasukanForm({ ...pasukanForm, position: e.target.value })
                              }
                              style={{ color: '#020617' }}
                              className="w-full bg-transparent text-sm font-bold text-slate-950 focus:outline-none"
                            >
                              {PASUKAN_POSITIONS.map((pos) => (
                                <option key={pos} value={pos}>
                                  {pos}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div
                          ref={(el) => {
                            pasukanFieldRefs.current.nisn = el;
                          }}
                        >
                          <label className="block text-xs font-black uppercase text-[#092D32] mb-1">
                            e. NISN (Wajib Berupa Angka) *
                          </label>
                          <div className="neu-inset rounded-xl px-3.5 py-2.5">
                            <input
                              type="text"
                              inputMode="numeric"
                              value={pasukanForm.nisn}
                              onChange={(e) => {
                                setPasukanForm({ ...pasukanForm, nisn: e.target.value });
                                if (pasukanErrors.nisn) {
                                  setPasukanErrors({ ...pasukanErrors, nisn: '' });
                                }
                              }}
                              style={{ color: '#020617' }}
                              placeholder="Contoh: 0081234567"
                              className="w-full bg-transparent font-mono text-sm font-bold text-slate-950 focus:outline-none"
                            />
                          </div>
                          {pasukanErrors.nisn && (
                            <p className="mt-1 text-xs font-bold text-[#E11D48]">
                              {pasukanErrors.nisn}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-200/70 flex flex-col items-center">
                        <span className="text-[11px] font-black uppercase tracking-widest text-[#64748B] mb-3">
                          LIVE PREVIEW KARTU ID PASUKAN
                        </span>
                        <TeamIdCardPreview
                          person={pasukanForm}
                          schoolName={detectedSchoolName}
                          schoolLogo={profileForm.logoDataUrl}
                          type="PASUKAN"
                          indexNumber={(portalData?.pasukanList?.length || 0) + 1}
                        />
                      </div>

                      <div className="flex justify-end gap-3 pt-3 border-t border-slate-200/70">
                        <button
                          type="button"
                          onClick={() => {
                            setShowPasukanForm(false);
                            setEditingPasukanId(null);
                          }}
                          className="px-5 py-2.5 rounded-2xl neu-btn text-slate-700 font-bold text-xs cursor-pointer"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-3 rounded-2xl neu-btn-primary bg-gradient-to-r from-[#006569] via-[#092D32] to-[#004d50] text-[#FFDD00] hover:text-white font-black text-xs uppercase tracking-wider cursor-pointer shadow-md hover:shadow-lg transition-all"
                        >
                          Simpan Biodata Pasukan
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* FORM TAMBAH / EDIT OFFICIAL */}
                {canEdit && showOfficialForm && (
                  <div className="neu-card rounded-3xl p-6 sm:p-8 space-y-6 animate-fade-in">
                    <div className="flex items-center justify-between border-b border-slate-200/70 pb-3">
                      <h3 className="text-base sm:text-lg font-black text-[#092D32]">
                        {editingOfficialId ? 'Edit Biodata Official' : 'Form Tambah Biodata Official'}
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          setShowOfficialForm(false);
                          setEditingOfficialId(null);
                        }}
                        className="p-2 rounded-2xl neu-btn text-slate-600 hover:text-slate-950 cursor-pointer"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    <form onSubmit={handleSubmitOfficial} className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div
                          ref={(el) => {
                            officialFieldRefs.current.photoDataUrl = el;
                          }}
                          className={`rounded-2xl border-2 border-dashed p-4 ${
                            officialErrors.photoDataUrl
                              ? 'border-[#E11D48] bg-rose-50/50'
                              : 'border-[#092D32]/30 bg-[#F5F8F6]'
                          }`}
                        >
                          <label className="block text-xs font-black uppercase text-[#092D32] mb-1">
                            a. Foto Profil (.jpg, .png, .svg, .webp · Maks 100 KB) *
                          </label>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="w-16 h-20 rounded-xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                              {officialForm.photoDataUrl ? (
                                <img
                                  src={officialForm.photoDataUrl}
                                  alt="Preview Official"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Users size={22} className="text-slate-300" />
                              )}
                            </div>
                            <div className="space-y-1.5">
                              <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl neu-btn-primary bg-gradient-to-r from-[#006569] via-[#092D32] to-[#004d50] text-[#FFDD00] hover:text-white font-black text-xs uppercase cursor-pointer shadow-sm">
                                <Upload size={13} /> Pilih Foto
                                <input
                                  type="file"
                                  accept=".jpg,.jpeg,.png,.svg,.webp"
                                  onChange={handleOfficialPhotoChange}
                                  className="hidden"
                                />
                              </label>
                              {officialForm.photoFileName && (
                                <p className="text-[11px] font-bold text-[#059669]">
                                  ✓ {officialForm.photoFileName} ({officialForm.photoSizeKb} KB)
                                </p>
                              )}
                              {officialErrors.photoDataUrl && (
                                <p className="text-[11px] font-bold text-[#E11D48]">
                                  {officialErrors.photoDataUrl}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div
                            ref={(el) => {
                              officialFieldRefs.current.fullName = el;
                            }}
                          >
                            <label className="block text-xs font-black uppercase text-[#092D32] mb-1">
                              b. Nama Lengkap Official *
                            </label>
                            <div className="neu-inset rounded-xl px-3.5 py-2.5">
                              <input
                                type="text"
                                value={officialForm.fullName}
                                onChange={(e) => {
                                  setOfficialForm({ ...officialForm, fullName: e.target.value });
                                  if (officialErrors.fullName) {
                                    setOfficialErrors({ ...officialErrors, fullName: '' });
                                  }
                                }}
                                style={{ color: '#020617' }}
                                placeholder="Nama lengkap pelatih / official pendamping"
                                className="w-full bg-transparent text-sm font-bold text-slate-950 focus:outline-none"
                              />
                            </div>
                            {officialErrors.fullName && (
                              <p className="mt-1 text-xs font-bold text-[#E11D48]">
                                {officialErrors.fullName}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-xs font-black uppercase text-[#092D32] mb-1">
                              c. Posisi Official *
                            </label>
                            <div className="neu-inset rounded-xl px-3.5 py-2.5">
                              <select
                                value={officialForm.position}
                                onChange={(e) =>
                                  setOfficialForm({ ...officialForm, position: e.target.value })
                                }
                                style={{ color: '#020617' }}
                                className="w-full bg-transparent text-sm font-bold text-slate-950 focus:outline-none"
                              >
                                {OFFICIAL_POSITIONS.map((pos) => (
                                  <option key={pos} value={pos}>
                                    {pos}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-3 border-t border-slate-200/70">
                        <button
                          type="button"
                          onClick={() => {
                            setShowOfficialForm(false);
                            setEditingOfficialId(null);
                          }}
                          className="px-5 py-2.5 rounded-2xl neu-btn text-slate-700 font-bold text-xs cursor-pointer"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-3 rounded-2xl neu-btn-primary bg-gradient-to-r from-[#006569] via-[#092D32] to-[#004d50] text-[#FFDD00] hover:text-white font-black text-xs uppercase tracking-wider cursor-pointer shadow-md hover:shadow-lg transition-all"
                        >
                          Simpan Biodata Official
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* DAFTAR KARTU ID PASUKAN & OFFICIAL */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
                  <h3 className="text-base font-black text-[#092D32]">
                    Daftar Kartu Pasukan ({portalData?.pasukanList?.length || 0}/18) &amp; Official ({portalData?.officialList?.length || 0}/2)
                  </h3>

                  {(portalData?.pasukanList?.length || 0) === 0 &&
                  (portalData?.officialList?.length || 0) === 0 ? (
                    <div className="rounded-2xl border-2 border-dashed border-slate-200 p-10 text-center space-y-3 bg-[#F5F8F6]">
                      <Users size={36} className="mx-auto text-slate-300" />
                      <p className="text-sm font-bold text-[#092D32]">
                        Belum ada data Pasukan atau Official yang diinput.
                      </p>
                      {canEdit && (
                        <p className="text-xs text-[#64748B]">
                          Gunakan tombol <strong>Tambah Pasukan</strong> atau{' '}
                          <strong>Tambah Official</strong> di atas untuk mulai mengisi.
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
                      {(portalData?.pasukanList || []).map((p, idx) => (
                        <div key={p.id} className="flex flex-col items-center gap-2 w-full">
                          <TeamIdCardPreview
                            person={p}
                            schoolName={detectedSchoolName}
                            schoolLogo={profileForm.logoDataUrl}
                            type="PASUKAN"
                            indexNumber={idx + 1}
                          />
                          {canEdit && (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingPasukanId(p.id);
                                  setPasukanForm({
                                    photoDataUrl: p.photoDataUrl || '',
                                    photoFileName: p.photoFileName || '',
                                    photoSizeKb: p.photoSizeKb || 0,
                                    fullName: p.fullName || '',
                                    position: p.position || 'Pasukan Inti',
                                    nisn: p.nisn || '',
                                  });
                                  setShowPasukanForm(true);
                                  setShowOfficialForm(false);
                                }}
                                className="px-3 py-1 rounded-lg bg-[#F5F8F6] hover:bg-slate-200 text-[#092D32] text-xs font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <Edit3 size={12} /> Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeletePasukan(p.id, p.fullName)}
                                className="px-3 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-[#E11D48] text-xs font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <Trash2 size={12} /> Hapus
                              </button>
                            </div>
                          )}
                        </div>
                      ))}

                      {(portalData?.officialList || []).map((o, idx) => (
                        <div key={o.id} className="flex flex-col items-center gap-2 w-full">
                          <TeamIdCardPreview
                            person={o}
                            schoolName={detectedSchoolName}
                            schoolLogo={profileForm.logoDataUrl}
                            type="OFFICIAL"
                            indexNumber={idx + 1}
                          />
                          {canEdit && (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingOfficialId(o.id);
                                  setOfficialForm({
                                    photoDataUrl: o.photoDataUrl || '',
                                    photoFileName: o.photoFileName || '',
                                    photoSizeKb: o.photoSizeKb || 0,
                                    fullName: o.fullName || '',
                                    position: o.position || 'Official 1',
                                  });
                                  setShowOfficialForm(true);
                                  setShowPasukanForm(false);
                                }}
                                className="px-3 py-1 rounded-lg bg-[#F5F8F6] hover:bg-slate-200 text-[#092D32] text-xs font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <Edit3 size={12} /> Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteOfficial(o.id, o.fullName)}
                                className="px-3 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-[#E11D48] text-xs font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <Trash2 size={12} /> Hapus
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ================================================================
                MODULE 4: TIMELINE ACARA
  );
}
