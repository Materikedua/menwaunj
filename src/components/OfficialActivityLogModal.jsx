import React from 'react';
import { History, Shield, Clock, CheckCircle2, AlertCircle, X, User } from 'lucide-react';

export function OfficialActivityLogModal({ isOpen, onClose, portalData }) {
  if (!isOpen) return null;

  const logs = Array.isArray(portalData?.activityLogs) ? portalData.activityLogs : [];

  const getActionBadge = (action) => {
    switch (action) {
      case 'PIN_UPDATED':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">PIN Diperbarui</span>;
      case 'PIN_RESET_REQUESTED':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800">Reset Diminta</span>;
      case 'PIN_RESET_BY_ADMIN':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-800">Reset Mako Admin</span>;
      case 'SNAPSHOT_SAVED':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800">Snapshot Backup</span>;
      case 'SNAPSHOT_RESTORED':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800">Snapshot Dipulihkan</span>;
      case 'ROSTER_UPDATED':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-teal-100 text-teal-800">Roster Diperbarui</span>;
      case 'DOC_UPLOADED':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-800">Berkas Diunggah</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-700">{action}</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in font-sans">
      <div className="relative w-full max-w-lg max-h-[85vh] rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200 flex flex-col text-slate-900">
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-[#006569] flex items-center justify-center">
              <History size={20} />
            </div>
            <div>
              <h3 className="text-base font-black text-[#092D32]">
                Log Keamanan & Aktivitas Portal
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

        {/* List Log */}
        <div className="mt-4 flex-1 overflow-y-auto divide-y divide-slate-100 pr-1">
          {logs.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <History size={32} className="mx-auto mb-2 opacity-40" />
              <p>Belum ada rekaman riwayat aktivitas pada portal ini.</p>
            </div>
          ) : (
            logs.map((item, idx) => (
              <div key={idx} className="py-3 flex flex-col gap-1.5 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {getActionBadge(item.action)}
                    <span className="font-mono text-[10px] text-slate-500 flex items-center gap-1">
                      <Clock size={11} />
                      {new Date(item.timestamp).toLocaleString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                    <User size={11} />
                    {item.actor || 'Official'}
                  </span>
                </div>
                <p className="text-slate-700 text-[11px] leading-snug pl-1">
                  {item.details || '-'}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
          <span>Menampilkan hingga 50 aktivitas terakhir</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

export default OfficialActivityLogModal;
