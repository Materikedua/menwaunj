import React from 'react';
import { Plus, X, Lock, Upload, Loader2 } from 'lucide-react';

export function GeranatVotingAdminModal({
  adminModalOpen,
  setAdminModalOpen,
  isSuperAdmin,
  isAdminPinUnlocked,
  handleCreateTeam,
  newTeam,
  setNewTeam,
  handlePhotoSelect,
  isCompressingPhoto,
  previewPhoto,
}) {
  if (!adminModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-900 my-8">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#006569] text-[#FFDD00] flex items-center justify-center font-bold">
                  <Plus size={18} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Tambah Penerima / Posko Charity
                  </h3>
                  <span className="text-[10px] text-teal-700 font-mono">
                    Otoritas Komando Mako
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAdminModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {!isSuperAdmin && !isAdminPinUnlocked ? (
              <div className="space-y-4 py-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
                  <Lock size={22} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">Otorisasi Komando Diperlukan</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Penambahan penerima donasi / posko charity hanya dapat dilakukan oleh akun Superadmin Komando Mako (<code className="text-teal-700 font-bold">unjmenwa@gmail.com</code>) yang terautentikasi.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAdminModalOpen(false)}
                  className="w-full py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            ) : (

            <form onSubmit={handleCreateTeam} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Nama Inisiatif / Penerima *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Beasiswa Taruna Menwa - Farhan / Posko Sembako Bencana"
                  value={newTeam.teamName}
                  onChange={(e) => setNewTeam({ ...newTeam, teamName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-[#006569]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Asal Lembaga / Lokasi Posko *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Batalyon Jayakarta / Posko Lapangan Cianjur"
                  value={newTeam.institution}
                  onChange={(e) => setNewTeam({ ...newTeam, institution: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-[#006569]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Kategori Inisiatif</label>
                <select
                  value={newTeam.category}
                  onChange={(e) => setNewTeam({ ...newTeam, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-[#006569]"
                >
                  <option value="Beasiswa Menwa">🎓 Beasiswa Menwa (Menwa Scholarship)</option>
                  <option value="Logistik Bencana">📦 Bantuan Logistik Kemanusiaan</option>
                  <option value="Aksi Karhutla">🔥 Aksi Cepat Tanggap Karhutla</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Penanggung Jawab / Kontak</label>
                <input
                  type="text"
                  placeholder="Nama Penanggung Jawab"
                  value={newTeam.dantonName}
                  onChange={(e) => setNewTeam({ ...newTeam, dantonName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-[#006569]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Target Donasi (Rp)</label>
                <input
                  type="number"
                  placeholder="Contoh: 5000000"
                  value={newTeam.targetDonation}
                  onChange={(e) => setNewTeam({ ...newTeam, targetDonation: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-[#006569]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Deskripsi / Motto Inisiatif</label>
                <input
                  type="text"
                  placeholder="Keterangan singkat penyaluran donasi"
                  value={newTeam.motto}
                  onChange={(e) => setNewTeam({ ...newTeam, motto: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-[#006569]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Foto / Poster Inisiatif *</label>
                
                {/* Opsi Upload Langsung dari File */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-teal-50 hover:border-[#006569] border-2 border-dashed border-slate-300 rounded-xl cursor-pointer transition text-slate-700 font-bold">
                      <Upload size={14} className="text-[#006569]" />
                      <span>{isCompressingPhoto ? 'Mengompres Foto...' : 'Unggah File Foto (JPG/PNG/WebP)'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoSelect}
                        disabled={isCompressingPhoto}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Thumbnail Preview */}
                  {previewPhoto && (
                    <div className="relative w-full h-32 rounded-xl overflow-hidden border-2 border-emerald-500/50 bg-slate-100 flex items-center justify-center">
                      <img
                        src={previewPhoto}
                        alt="Pratinjau Foto"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewPhoto('');
                          setNewTeam(prev => ({ ...prev, photoUrl: '' }));
                        }}
                        className="absolute top-2 right-2 p-1 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition"
                        title="Hapus Foto"
                      >
                        <X size={14} />
                      </button>
                      <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-slate-900/80 text-[#FFDD00] text-[10px] font-mono font-bold">
                        ✓ Foto Siap Digunakan
                      </span>
                    </div>
                  )}

                  {/* Pilihan Cepat Preset Resmi */}
                  <div className="pt-1">
                    <span className="text-[10px] font-bold text-slate-500 block mb-1">Atau pilih preset visual satuan:</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { label: 'Kampus UNJ', url: '/foto-kampus-unj.jpg' },
                        { label: 'Posko Cianjur', url: '/dokumentasi/pengabdian25.svg' },
                        { label: 'KC VIII', url: '/kegiatan/kc-menwa-unj.jpg' },
                        { label: 'LFPB Geranat', url: '/geranat-menwa-unj.png' },
                      ].map(preset => (
                        <button
                          key={preset.url}
                          type="button"
                          onClick={() => {
                            setPreviewPhoto(preset.url);
                            setNewTeam(prev => ({ ...prev, photoUrl: preset.url }));
                          }}
                          className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold text-left transition ${
                            newTeam.photoUrl === preset.url
                              ? 'bg-teal-50 border-[#006569] text-[#006569] font-bold'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Fallback Input URL */}
                  <div className="pt-1">
                    <input
                      type="url"
                      placeholder="Atau tautan URL kustom (https://...)"
                      value={newTeam.photoUrl}
                      onChange={(e) => {
                        setNewTeam({ ...newTeam, photoUrl: e.target.value });
                        setPreviewPhoto(e.target.value);
                      }}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-[11px] focus:outline-none focus:border-[#006569]"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAdminModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#006569] hover:bg-[#004d50] text-[#FFDD00] font-black rounded-xl uppercase tracking-wider transition shadow-md cursor-pointer"
                >
                  Simpan Inisiatif
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
  );
}