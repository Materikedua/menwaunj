import React from 'react';
import { Search, Plus } from 'lucide-react';

export function GeranatVotingFilterBar({
  categoryFilter,
  setCategoryFilter,
  searchQuery,
  setSearchQuery,
  setAdminModalOpen,
}) {
  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {[
                { id: 'all', label: 'Semua Inisiatif' },
                { id: 'beasiswa', label: '🎓 Beasiswa Menwa' },
                { id: 'logistik', label: '📦 Logistik Bencana' },
                { id: 'karhutla', label: '🔥 Aksi Karhutla' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    categoryFilter === cat.id
                      ? 'bg-[#006569] text-[#FFDD00] shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Input Pencarian & Tombol Tambah Penerima */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari penerima / inisiatif..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#006569]"
                />
              </div>

              <button
                type="button"
                onClick={() => setAdminModalOpen(true)}
                className="px-3.5 py-2 bg-[#006569] hover:bg-[#004d50] text-[#FFDD00] font-bold text-xs rounded-xl transition shadow flex items-center gap-1.5 cursor-pointer shrink-0"
                title="Tambah inisiatif atau penerima charity baru"
              >
                <Plus size={14} />
                <span className="hidden sm:inline">Penerima Baru</span>
              </button>
            </div>
          </div>

  );
}
