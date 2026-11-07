import React from 'react';
import { FileText } from 'lucide-react';

export function UserAccountSubmissionsTab({ submissionsLoading, submissions }) {
  return (
    <div className="space-y-3">
      {submissionsLoading ? (
        <div className="py-12 text-center text-xs text-slate-500 font-medium">
          Memuat daftar pengajuan berkas...
        </div>
      ) : submissions.length === 0 ? (
        <div className="py-12 text-center neu-inset rounded-2xl p-6">
          <FileText size={32} className="mx-auto text-slate-400 mb-2" />
          <p className="text-xs font-black text-[#092D32]">
            Belum ada formulir yang diajukan
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Formulir pendaftaran dan permohonan dinas yang Anda isi akan muncul di sini.
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {submissions.map((sub) => (
            <div
              key={sub.submissionId}
              className="p-4 neu-card-sm rounded-2xl space-y-2"
            >
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="font-black text-[#092D32]">{sub.submissionId}</span>
                <span className="font-black text-[#006569]">
                  {sub.status?.replace('_', ' ')?.toUpperCase()}
                </span>
              </div>
              <h4 className="font-black text-xs text-[#092D32]">
                {sub.title || sub.serviceType}
              </h4>
              <p className="text-[11px] text-slate-600 leading-snug line-clamp-2">
                {sub.notes || sub.purpose}
              </p>
              <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>
                  {new Date(sub.createdAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
                <span className="font-sans font-bold text-[#006569]">
                  {sub.institution}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

