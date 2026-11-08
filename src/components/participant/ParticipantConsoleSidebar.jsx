import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { playTactileClick } from '../../lib/tactileAudio.js';
import { navigate } from '../../lib/router.jsx';

export function ParticipantConsoleSidebar({
  portalData,
  activeModule,
  setActiveModule,
  DOCK_ITEMS,
  isGuestMode,
}) {
  return (
    <aside className="lg:col-span-3 xl:col-span-2 bg-[#092D32] rounded-3xl p-4 sm:p-5 text-white flex flex-col justify-between shadow-md border border-slate-700/50">
      <div className="space-y-6">
        {/* Tablet OS Top Window Dots & Brand Lockup */}
        <div className="px-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
            </div>
            <span className="font-mono text-[10px] font-bold text-[#FFDD00]/80">
              {portalData?.nomorUrut || 'KONTINGEN-01'}
            </span>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <div className="w-10 h-10 rounded-2xl bg-white p-1.5 flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
              <img
                src={portalData?.schoolProfile?.logoDataUrl || '/logo-menwa-unj.png'}
                alt="Logo"
                onError={(e) => {
                  e.currentTarget.src = '/logo-menwa-unj.png';
                }}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] font-mono font-black uppercase tracking-wider text-[#FFDD00] block">
                GERANAT · 2026
              </span>
              <h4 className="text-xs font-black text-white truncate">
                {portalData?.schoolProfile?.schoolName || portalData?.schoolName || 'Kontingen'}
              </h4>
            </div>
          </div>
        </div>

        {/* Vertical Dock Items */}
        <nav className="space-y-1.5">
          {DOCK_ITEMS.map((item) => {
            const isActive = activeModule === item.id;
            const IconComp = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  playTactileClick('pill');
                  setActiveModule(item.id);
                }}
                className={`w-full p-2.5 rounded-2xl flex items-center justify-between transition-all duration-300 text-xs font-bold cursor-pointer group ${
                  isActive
                    ? 'bg-gradient-to-r from-[#006569] to-[#004d50] text-[#FFDD00] shadow-md border border-[#FFDD00]/30 font-black'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <IconComp
                    size={16}
                    className={
                      isActive
                        ? 'text-[#FFDD00] shrink-0'
                        : 'text-slate-400 group-hover:text-white shrink-0'
                    }
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full shrink-0 font-black ${
                    isActive
                      ? 'bg-black/40 text-[#FFDD00]'
                      : 'bg-white/10 text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Dock Bottom Status & Exit */}
      <div className="pt-6 mt-6 border-t border-white/10 space-y-3 px-1">
        <div className="rounded-2xl bg-white/5 border border-white/10 p-3 text-[11px] space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Keamanan PIN</span>
            <span className="font-mono font-bold text-[#FFDD00]">
              {isGuestMode ? 'READ-ONLY' : 'TERKUNCI PIN'}
            </span>
          </div>
          <div className="text-[10px] text-teal-200/90 truncate">
            WA: +62 {portalData?.whatsappNumber || '-'}
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/geranat#portal-official')}
          className="w-full py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Kembali ke GERANAT</span>
        </button>
      </div>
    </aside>
  );
}

