import React from 'react';
import {
  FileCheck,
  Lock,
  Upload,
  Loader2,
  CheckCircle2,
  ExternalLink,
  Trash2,
  AlertCircle,
  Download,
} from 'lucide-react';

export function ParticipantModulePemberkasan({
  REQUIRED_DOCS = [],
  portalData,
  docUploadError,
  uploadingDocId,
  handleDocUpload,
  handleDeleteDocument,
  isGuestMode,
  canEdit = true,
  hasAdminAccess = false,
  handleVerifyDocumentByAdmin,
  progress = {},
}) {
  return (
              <div className="neu-card rounded-3xl p-6 sm:p-8 space-y-6 animate-fade-in">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/70 pb-4">
                  <div>
                    <span className="text-[10px] font-mono font-black uppercase tracking-widest text-[#059669] block">
                      MODUL 02 · ADMINISTRASI KONTINGEN
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-[#092D32]">
                      Pemberkasan Dokumen Wajib
                    </h2>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      Unduh template resmi di samping tombol Upload, lalu unggah dokumen yang telah dilengkapi.
                    </p>
                  </div>
                  <span className="font-mono text-xs font-black text-[#059669]">
                    {progress?.berkasCount || 0} / 5 Dokumen Terunggah ({progress?.berkasPct || 0}%)
                  </span>
                </div>

                {docUploadError && (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-[#E11D48]/30 text-[#E11D48] text-xs font-bold flex items-center gap-2">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{docUploadError}</span>
                  </div>
                )}

                <div className="space-y-4">
                  {(REQUIRED_DOCS || []).map((docItem) => {
                    const uploaded = portalData?.documents?.[docItem.id];
                    const isVerified = uploaded?.status === 'terverifikasi';
                    return (
                      <div
                        key={docItem.id}
                        className={`rounded-2xl neu-card-sm p-5 transition flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                          uploaded ? 'ring-1 ring-[#059669]/35' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3.5 min-w-0">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                              uploaded
                                ? 'bg-[#059669] text-white'
                                : 'bg-[#092D32] text-[#FFDD00]'
                            }`}
                          >
                            {docItem.code.toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-sm font-black text-[#092D32]">
                                {docItem.code}. {docItem.title}
                              </h4>
                              <span className="text-xs font-bold text-[#006569]">
                                · {uploaded ? (isVerified ? 'Terverifikasi Admin' : 'Terunggah') : 'Belum Diunggah'}
                              </span>
                            </div>
                            <p className="text-xs text-[#64748B] mt-1">{docItem.desc}</p>
                            {uploaded && (
                              <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] font-semibold text-[#059669]">
                                <span>
                                  {uploaded.fileName} ({uploaded.fileSizeKb || 0} KB)
                                </span>
                                {uploaded.fileDataUrl && (
                                  <a
                                    href={uploaded.fileDataUrl}
                                    download={uploaded.fileName}
                                    className="text-[#006569] underline hover:text-[#092D32]"
                                  >
                                    Lihat / Unduh Berkas
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                          <a
                            href={docItem.templateUrl}
                            download
                            className="px-3.5 py-2.5 rounded-2xl neu-btn bg-white hover:bg-slate-50 text-[#092D32] border border-slate-200/90 font-bold text-xs flex items-center gap-1.5 transition shadow-xs"
                          >
                            <Download size={14} className="text-[#006569]" />
                            <span>Unduh Template</span>
                          </a>

                          {canEdit && (
                            <label className="px-4 py-2.5 rounded-2xl neu-btn-primary bg-gradient-to-r from-[#006569] via-[#092D32] to-[#004d50] text-[#FFDD00] hover:text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition shadow-md hover:shadow-lg">
                              <Upload size={14} />
                              <span>
                                {uploadingDocId === docItem.id
                                  ? 'Mengunggah...'
                                  : uploaded
                                  ? 'Ganti File'
                                  : 'Upload'}
                              </span>
                              <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png,.webp"
                                onChange={(e) => handleDocUpload && handleDocUpload(docItem, e)}
                                className="hidden"
                              />
                            </label>
                          )}

                          {uploaded && hasAdminAccess && (
                            <button
                              type="button"
                              onClick={() => handleVerifyDocumentByAdmin && handleVerifyDocumentByAdmin(docItem.id)}
                              className="px-3 py-2.5 rounded-2xl bg-[#059669] hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer"
                            >
                              {isVerified ? 'Batalkan Verifikasi' : 'Verifikasi'}
                            </button>
                          )}

                          {uploaded && canEdit && (
                            <button
                              type="button"
                              onClick={() => handleDeleteDocument(docItem.id, docItem.title)}
                              className="p-2.5 rounded-2xl neu-btn text-[#E11D48] transition cursor-pointer"
                              title="Hapus Berkas"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
  );
}
