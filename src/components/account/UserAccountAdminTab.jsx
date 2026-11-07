import React from 'react';
import { ShieldCheck } from 'lucide-react';

export function UserAccountAdminTab({
  isAdmin,
  isSuperAdmin,
  loadAllUsers,
  loadingUsers,
  allUsers,
  handleRoleChange,
  handleToggleVerification,
  VALID_ROLES,
}) {
  if (!isAdmin) return null;

  return (
    <div className="space-y-4">
      <div className="p-3.5 neu-card-sm rounded-2xl flex items-center justify-between">
        <div>
          <h4 className="text-xs font-black text-[#092D32]">
            Panel Otorisasi RBAC &amp; Verifikasi NBP Anggota
          </h4>
          <p className="text-[11px] text-slate-600">
            Kelola peran personel (`dansat`, `wadansat`, `staf_adminu`, `anggota_verified`, `public_user`)
          </p>
        </div>
        <button
          type="button"
          onClick={loadAllUsers}
          className="px-4 py-2 neu-btn-primary bg-gradient-to-r from-[#006569] via-[#092D32] to-[#004d50] text-[#FFDD00] hover:text-white text-xs font-black rounded-xl cursor-pointer shadow-sm hover:shadow transition-all"
        >
          Muat Ulang
        </button>
      </div>

      {loadingUsers ? (
        <div className="py-8 text-center text-xs text-slate-500 font-mono">
          Memeriksa pangkalan data personel...
        </div>
      ) : (
        <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
          {allUsers.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              Belum ada data pengguna terdaftar.
            </div>
          ) : (
            allUsers.map((u) => {
              const targetId = u.uid || u.id;
              return (
                <div
                  key={targetId}
                  className="p-3.5 neu-card-sm rounded-2xl flex flex-wrap items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-[#092D32] truncate">
                        {u.displayName || 'Pengguna'}
                      </span>
                      {u.isVerifiedMenwa && (
                        <ShieldCheck size={14} className="text-[#006569] shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 truncate">{u.email}</p>
                    <p className="text-[10px] font-mono text-[#006569] font-bold">
                      NBP: {u.menwaNia || '-'} · Peran: {u.role || 'public_user'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isSuperAdmin && (
                      <div className="neu-inset rounded-xl px-2.5 py-1.5">
                        <select
                          value={
                            u.role ||
                            (u.isVerifiedMenwa ? 'anggota_verified' : 'public_user')
                          }
                          onChange={(e) => handleRoleChange(targetId, e.target.value)}
                          style={{ color: '#020617' }}
                          className="bg-transparent text-xs font-bold text-slate-950 focus:outline-none"
                        >
                          {VALID_ROLES.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        handleToggleVerification(targetId, u.isVerifiedMenwa)
                      }
                      className={`px-3 py-1.5 rounded-xl text-xs font-black shrink-0 cursor-pointer ${
                        u.isVerifiedMenwa
                          ? 'neu-btn text-rose-700'
                          : 'neu-btn-primary text-[#FFDD00]'
                      }`}
                    >
                      {u.isVerifiedMenwa ? 'Cabut Verifikasi' : 'Verifikasi Anggota'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

