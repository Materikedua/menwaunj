import React from 'react';
import {
  Layers,
  LayoutGrid,
  CalendarDays,
  ChevronDown,
  Search,
  X,
  RotateCcw,
} from 'lucide-react';
import { playTactileClick } from '../../lib/tactileAudio.js';
import { PROKER_12_MONTHS, EXTRA_ACTIVITIES } from '../../data/menwaInteractiveData.js';

export function DocWallFilterBar({
  viewMode,
  setViewMode,
  setShowcaseSlideIndex,
  GALLERY_CATEGORIES,
  selectedCategoryGroup,
  setSelectedCategoryGroup,
  selectedActivityId,
  setSelectedActivityId,
  setShowcaseAlbumIndex,
  extraDropdownRef,
  extraDropdownOpen,
  setExtraDropdownOpen,
  searchQuery,
  setSearchQuery,
  selectedYear,
  setSelectedYear,
  AVAILABLE_YEARS,
  sortBy,
  setSortBy,
  isFiltered,
  handleResetFilters,
}) {
  return (
        <div className="relative z-30 rounded-3xl neu-card p-3.5 sm:p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 shadow-md">
          {/* Sisi Kiri: Switcher 3 Mode Tampilan (Showcase Album | Grid Klasik | Garis Waktu) */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="neu-pill-bar">
              <button
                type="button"
                onClick={() => {
                  playTactileClick('pill');
                  setViewMode('showcase');
                  setShowcaseSlideIndex(0);
                }}
                className={
                  viewMode === 'showcase'
                    ? 'neu-pill-tab-dark'
                    : 'neu-pill-tab'
                }
                title="Tampilan Showcase Album"
              >
                <Layers size={14} className={viewMode === 'showcase' ? 'text-amber-400' : 'text-amber-500'} />
                <span>Showcase Album</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playTactileClick('pill');
                  setViewMode('grid');
                }}
                className={
                  viewMode === 'grid'
                    ? 'neu-pill-tab-dark'
                    : 'neu-pill-tab'
                }
                title="Tampilan Grid Foto Klasik"
              >
                <LayoutGrid size={14} className={viewMode === 'grid' ? 'text-emerald-400' : 'text-emerald-600'} />
                <span>Grid Klasik</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playTactileClick('pill');
                  setViewMode('timeline');
                }}
                className={
                  viewMode === 'timeline'
                    ? 'neu-pill-tab-dark'
                    : 'neu-pill-tab'
                }
                title="Tampilan Kronik Garis Waktu"
              >
                <CalendarDays size={14} className={viewMode === 'timeline' ? 'text-sky-400' : 'text-sky-600'} />
                <span>Garis Waktu</span>
              </button>
            </div>

            {/* Filter Kategori Singkat (Pills Ref: Image 1) */}
            <div className="hidden xl:flex items-center gap-1.5 pl-2 border-l border-slate-200">
              {GALLERY_CATEGORIES.map((cat) => {
                const active = selectedCategoryGroup === cat.id && selectedActivityId === 'ALL';
                const IconComponent = cat.icon;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategoryGroup(cat.id);
                      setSelectedActivityId('ALL');
                      setShowcaseAlbumIndex(0);
                    }}
                    className={
                      active
                        ? 'neu-pill-tab-dark'
                        : 'neu-pill-tab'
                    }
                  >
                    <IconComponent
                      size={13}
                      className={
                        active
                          ? 'text-[#FFDD00]'
                          : cat.id === 'ALL'
                          ? 'text-teal-600'
                          : cat.id === 'LFPB'
                          ? 'text-amber-500'
                          : cat.id === 'DIKLAT'
                          ? 'text-emerald-600'
                          : cat.id === 'BAKSOS'
                          ? 'text-rose-500'
                          : cat.id === 'SEMINAR'
                          ? 'text-blue-500'
                          : 'text-purple-500'
                      }
                    />
                    <span>{cat.short}</span>
                  </button>
                );
              })}
            </div>

            {/* Dropdown Proker Tertentu */}
            <div className="relative" ref={extraDropdownRef}>
              <button
                type="button"
                onClick={() => setExtraDropdownOpen((prev) => !prev)}
                className={`neu-pill-tab ${
                  selectedActivityId !== 'ALL'
                    ? 'neu-pill-tab-dark'
                    : ''
                }`}
              >
                <span>
                  {selectedActivityId !== 'ALL'
                    ? PROKER_12_MONTHS.find((p) => p.id === selectedActivityId)?.shortName ||
                      EXTRA_ACTIVITIES.find((e) => e.id === selectedActivityId)?.shortName ||
                      'Proker Aktif'
                    : 'Pilih Proker'}
                </span>
                <ChevronDown size={13} className={`transition-transform ${extraDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {extraDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 rounded-2xl neu-card p-2.5 z-50 shadow-2xl">
                  <div className="max-h-60 space-y-1 overflow-y-auto pr-1">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedActivityId('ALL');
                        setExtraDropdownOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-1.5 text-left text-xs font-bold ${
                        selectedActivityId === 'ALL'
                          ? 'bg-[#006569] text-white'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span>Semua Program Kerja</span>
                    </button>
                    {PROKER_12_MONTHS.map((proker) => (
                      <button
                        key={proker.id}
                        type="button"
                        onClick={() => {
                          setSelectedCategoryGroup('ALL');
                          setSelectedActivityId(proker.id);
                          setExtraDropdownOpen(false);
                          setShowcaseAlbumIndex(0);
                        }}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-1.5 text-left text-xs font-bold transition ${
                          selectedActivityId === proker.id
                            ? 'bg-[#006569] text-white'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span className="truncate">{proker.name}</span>
                        <span className="text-[10px] font-mono opacity-75">{proker.monthCode}</span>
                      </button>
                    ))}
                    {EXTRA_ACTIVITIES.map((act) => (
                      <button
                        key={act.id}
                        type="button"
                        onClick={() => {
                          setSelectedCategoryGroup('ALL');
                          setSelectedActivityId(act.id);
                          setExtraDropdownOpen(false);
                          setShowcaseAlbumIndex(0);
                        }}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-1.5 text-left text-xs font-bold transition ${
                          selectedActivityId === act.id
                            ? 'bg-[#006569] text-white'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span className="truncate">{act.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sisi Kanan: Pencarian, Tahun, Urutan, & Reset (Ref: Image 4 Warm Luminous Pill) */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Input Pencarian Backlit Warm Glow (Ref: Image 4) */}
            <div className="neu-search-capsule flex-1 sm:flex-none sm:w-60 px-4 py-2">
              <Search size={14} className="text-slate-800 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowcaseAlbumIndex(0);
                }}
                style={{ color: '#000000', backgroundColor: '#FFFFFF' }}
                placeholder="Cari giat / lokasi..."
                className="w-full bg-white text-black text-xs font-bold placeholder:text-slate-400 outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Filter Tahun Pill */}
            <div className="neu-pill-tab px-3.5 py-1.5 bg-white">
              <select
                value={selectedYear}
                onChange={(e) => {
                  setSelectedYear(e.target.value);
                  setShowcaseAlbumIndex(0);
                }}
                style={{ color: '#000000', backgroundColor: '#FFFFFF' }}
                className="bg-transparent text-black text-xs font-bold outline-none cursor-pointer"
              >
                {AVAILABLE_YEARS.map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>

            {/* Urutkan Berdasarkan Pill */}
            <div className="neu-pill-tab px-3.5 py-1.5 bg-white">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ color: '#000000', backgroundColor: '#FFFFFF' }}
                className="bg-transparent text-black text-xs font-bold outline-none cursor-pointer"
              >
                <option value="newest">Terbaru</option>
                <option value="likes">Terbanyak Disukai</option>
                <option value="comments">Paling Ramai</option>
              </select>
            </div>

            {/* Tombol Reset STRONG Red (Ref: Image 2) */}
            {isFiltered && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="neu-btn-strong-red inline-flex items-center gap-1 rounded-full px-3.5 py-2 text-xs font-black cursor-pointer shadow-sm"
                title="Reset semua penyaringan"
              >
                <RotateCcw size={13} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
  );
}
