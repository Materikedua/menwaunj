import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { MagneticButton } from './MenwaUI.jsx';

/* ============================================================
   NavBar — Ultra-Premium Crystalline Glassmorphism Navigation Bar
   Hardware-accelerated fixed header with smooth refraction lens
   ============================================================ */
export const NavBar = ({
  activeTab,
  onNavigate,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  navItems,
  MenuIcon,
  CloseIcon,
  rightSlot,
  logoSrc = '/logo-menwa-unj.png',
  onLogoError,
}) => {
  const listRef = useRef(null);
  const [pill, setPill] = useState({ left: 0, width: 0, opacity: 0 });
  const [hovered, setHovered] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const movePill = (el) => {
    if (!el || !listRef.current) return;
    const p = listRef.current.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    setPill({ left: r.left - p.left, width: r.width, opacity: 1 });
  };

  const resetPill = () => {
    let el = listRef.current?.querySelector(`[data-tab="${activeTab}"]`);
    if (!el) {
      el = listRef.current?.querySelector(`[data-children~="${activeTab}"]`);
    }
    if (el) movePill(el);
    else setPill((s) => ({ ...s, opacity: 0 }));
  };

  useEffect(() => {
    resetPill();
  }, [activeTab]);

  return (
    <>
      <header
        role="banner"
        className="fixed top-0 left-0 right-0 w-full z-50 font-sans"
        onMouseLeave={() => {
          setHovered(null);
          resetPill();
        }}
      >
        <nav
          className={`w-full font-sans transition-all duration-500 border-b nav-liquid-glass ${scrolled ? 'nav-liquid-glass--scrolled shadow-2xl' : ''
            }`}
        >
          <div className="h-[3px] w-full bg-gradient-to-r from-[#006569] via-[#FFDD00] to-[#006569] opacity-85" />

          {/* Dynamic Cylindrical Glass Sheen & Lens Reflection Overlay */}
          <div
            className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${scrolled ? 'opacity-100' : 'opacity-0'
              }`}
            style={{
              background:
                'radial-gradient(ellipse 95% 45% at 50% 0%, rgba(255,255,255,0.18) 0%, transparent 80%)',
            }}
            aria-hidden="true"
          />

          {/* Lapisan Lensa Refraksi Bawah: Melengkungkan & membiaskan tulisan di bawah header */}
          <div className="nav-liquid-lens-edge" aria-hidden="true" />

          <div className="max-w-[1760px] mx-auto px-3 sm:px-4 2xl:px-8">
            <div
              className={`flex justify-between items-center transition-all duration-500 ${scrolled ? 'h-12 md:h-16' : 'h-14 md:h-[72px]'
                }`}
            >
              <MagneticButton
                onClick={() => onNavigate('beranda')}
                strength={0.15}
                className="flex shrink-0 items-center cursor-pointer group bg-transparent no-neu"
              >
                <img
                  src={logoSrc}
                  onError={onLogoError}
                  alt="Logo Menwa UNJ"
                  className="w-7 h-7 md:w-9 md:h-9 xl:w-10 xl:h-10 object-contain mr-2 xl:mr-2.5 drop-shadow-md transition-transform duration-500 group-hover:scale-110"
                />
                <div className="text-left">
                  <h1 className="text-[11px] md:text-xs 2xl:text-sm font-black text-white whitespace-nowrap leading-tight tracking-tight">
                    RESIMEN MAHASISWA
                  </h1>
                  <p className="text-[8px] md:text-[9px] font-black text-[#FFDD00] tracking-[0.2em] uppercase">
                    Satuan UNJ
                  </p>
                </div>
              </MagneticButton>

              <div
                ref={listRef}
                className="hidden xl:flex relative min-w-0 items-center gap-0.5 xl:gap-1 2xl:gap-1.5 mr-2 2xl:mr-4"
              >
                <div
                  className="absolute top-1/2 -translate-y-1/2 h-9 rounded-full bg-white/10 border border-[#00A8AF]/40 backdrop-blur-md pointer-events-none"
                  style={{
                    left: pill.left,
                    width: pill.width,
                    opacity: pill.opacity,
                    transition:
                      'left 380ms cubic-bezier(.16,1,.3,1), width 380ms cubic-bezier(.16,1,.3,1), opacity 250ms',
                  }}
                />
                {navItems.map((item) => {
                  const isChildActive = Boolean(item.children?.some((c) => c.id === activeTab));
                  const isActive = activeTab === item.id || isChildActive;
                  const childrenIds = item.children
                    ? item.children.map((c) => c.id).join(' ')
                    : undefined;

                  return (
                    <button
                      key={item.id}
                      data-tab={item.id}
                      data-children={childrenIds}
                      onMouseEnter={(e) => {
                        setHovered(item.id);
                        movePill(e.currentTarget);
                      }}
                      onFocus={(e) => movePill(e.currentTarget)}
                      onClick={() => {
                        if (item.children && item.children.length > 0) {
                          const targetChild =
                            item.children.find((c) => c.id === activeTab) || item.children[0];
                          onNavigate(targetChild.id);
                        } else {
                          onNavigate(item.id);
                        }
                      }}
                      className={`no-neu relative z-10 whitespace-nowrap px-2.5 xl:px-3 py-1.5 rounded-full text-[10px] 2xl:text-[11px] font-bold uppercase tracking-tight transition-colors duration-300 flex items-center gap-1 cursor-pointer ${isActive ? 'text-[#FFDD00]' : 'text-slate-200 hover:text-white'
                        }`}
                    >
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="px-1.5 py-0.2 rounded-full text-[8.5px] font-black uppercase tracking-wider bg-[#FFDD00] text-slate-950 shadow-sm">
                          {item.badge}
                        </span>
                      )}
                      {item.children && (
                        <ChevronDown
                          size={12}
                          className={`transition-transform duration-300 ${hovered === item.id ? 'rotate-180 text-[#FFDD00]' : 'text-slate-400'
                            }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2.5">
                {rightSlot}
                <div className="xl:hidden">
                  <button
                    type="button"
                    aria-label={isMobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
                    aria-expanded={isMobileMenuOpen}
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="no-neu text-slate-200 hover:text-[#FFDD00]"
                  >
                    {isMobileMenuOpen ? CloseIcon : MenuIcon}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Dropdown Backdrop Curtain */}
          {hovered && (
            <div
              className="hidden xl:block fixed inset-0 top-[72px] bg-[#020a0d]/85 backdrop-blur-xl z-30 transition-opacity duration-300 pointer-events-auto"
              onClick={() => setHovered(null)}
              aria-hidden="true"
            />
          )}

          {/* Desktop Dropdown Mega-Menu ("Kegiatan & Lomba") */}
          <div
            className={`hidden xl:block absolute left-0 right-0 top-full origin-top z-40 transition-all duration-300 ${hovered
                ? 'opacity-100 translate-y-0 pointer-events-auto'
                : 'opacity-0 -translate-y-3 pointer-events-none'
              }`}
          >
            <div className="max-w-3xl mx-auto px-4">
              <div className="mt-3 rounded-3xl border border-white/20 nav-popup-frosted p-5 shadow-2xl">
                {navItems
                  .filter((i) => i.id === hovered)
                  .map((item) =>
                    item.children ? (
                      <div key={item.id} className="space-y-3">
                        <div className="flex items-center justify-between border-b border-white/15 pb-2.5">
                          <span className="text-xs font-black uppercase tracking-wider text-[#FFDD00] flex items-center gap-1.5">
                            {item.icon}
                            <span>{item.label}</span>
                      {item.badge && (
                        <span className="px-1.5 py-0.2 rounded-full text-[8.5px] font-black uppercase tracking-wider bg-[#FFDD00] text-slate-950 shadow-sm">
                          {item.badge}
                        </span>
                      )}
                          </span>
                          <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">
                            Pilih program
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {item.children.map((child) => {
                            const isChildActive = activeTab === child.id;
                            return (
                              <button
                                key={child.id}
                                type="button"
                                onClick={() => {
                                  onNavigate(child.id);
                                  setHovered(null);
                                }}
                                className={`text-left p-4 rounded-2xl transition-all duration-200 cursor-pointer group flex flex-col justify-between border ${
                                  isChildActive
                                    ? 'bg-gradient-to-br from-[#006569] to-[#00383b] border-[#FFDD00]/80 text-white shadow-lg'
                                    : 'bg-[#08222b] hover:bg-[#0d313c] border-white/12 hover:border-[#FFDD00]/60 text-slate-100 shadow-md'
                                }`}
                              >
                                <div>
                                  <div className="flex items-center justify-between mb-2.5">
                                    <span className="w-7 h-7 rounded-xl bg-black/60 border border-white/10 flex items-center justify-center shrink-0">
                                      {child.icon}
                                    </span>
                                    {child.badge && (
                                      <span className="text-[9px] font-black px-2.5 py-0.5 rounded-full bg-black/80 text-[#FFDD00] uppercase tracking-wider border border-[#FFDD00]/30 shadow-sm">
                                        {child.badge}
                                      </span>
                                    )}
                                  </div>
                                  <div className="font-black text-sm text-white group-hover:text-[#FFDD00] transition">
                                    {child.label}
                                  </div>
                                  <p className="text-[11px] text-slate-200 mt-1 line-clamp-2 leading-relaxed font-medium">
                                    {child.desc}
                                  </p>
                                </div>
                                <div className="mt-3 pt-2.5 border-t border-white/10 text-[10px] font-black uppercase tracking-wider text-[#FFDD00] flex items-center gap-1">
                                  <span>Buka</span>
                                  <ChevronRight
                                    size={12}
                                    className="transition-transform group-hover:translate-x-1"
                                  />
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <button
                        key={item.id}
                        onClick={() => {
                          onNavigate(item.id);
                          setHovered(null);
                        }}
                        className="w-full text-left flex items-start gap-3.5 p-3 rounded-2xl bg-slate-900/95 hover:bg-slate-800/95 border border-white/15 transition shadow-lg"
                      >
                        <span className="shrink-0 w-10 h-10 rounded-xl bg-[#006569] text-[#FFDD00] grid place-items-center shadow-lg border border-[#FFDD00]/30">
                          {item.icon}
                        </span>
                        <span>
                          <span className="block text-xs font-black text-white uppercase tracking-wide">
                            {item.label}
                          </span>
                          <span className="block text-xs text-slate-200 mt-0.5 leading-snug">
                            {item.desc}
                          </span>
                        </span>
                      </button>
                    )
                  )}
              </div>
            </div>
          </div>

          {/* Mobile Drawer Menu */}
          <div
            className={`xl:hidden overflow-y-auto overflow-x-hidden bg-slate-950 border-t border-slate-800 absolute w-full transition-[max-height] duration-500 ${isMobileMenuOpen ? 'max-h-[calc(100dvh-64px)]' : 'max-h-0'
              }`}
          >
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item) =>
                item.children ? (
                  <div key={item.id} className="space-y-1.5 py-1">
                    <div className="px-4 py-2 text-[11px] font-black uppercase tracking-wider text-[#FFDD00] flex items-center gap-2">
                      <span className="text-amber-400">{item.icon}</span>
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="px-1.5 py-0.2 rounded-full text-[8.5px] font-black uppercase tracking-wider bg-[#FFDD00] text-slate-950 shadow-sm">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <div className="pl-3 space-y-1 border-l-2 border-[#006569]/40 ml-4">
                      {item.children.map((child) => (
                        <button
                          key={child.id}
                          onClick={() => {
                            onNavigate(child.id);
                            setIsMobileMenuOpen(false);
                          }}
                          className={`block w-full text-left px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${activeTab === child.id
                              ? 'bg-[#006569] text-[#FFDD00]'
                              : 'text-slate-300 hover:bg-white/5'
                            }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {child.icon}
                              <span>{child.label}</span>
                            </div>
                            {child.badge && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-black/50 text-[#FFDD00]">
                                {child.badge}
                              </span>
                            )}
                          </div>
                          <span className="block text-[10px] font-medium normal-case tracking-normal text-slate-500 mt-0.5 truncate">
                            {child.desc}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`block w-full text-left px-5 py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider transition-all ${activeTab === item.id
                        ? 'bg-[#006569] text-[#FFDD00]'
                        : 'text-slate-300 hover:bg-white/5'
                      }`}
                  >
                    {item.label}
                    <span className="block text-[11px] font-medium normal-case tracking-normal text-slate-500 mt-0.5">
                      {item.desc}
                    </span>
                  </button>
                )
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* Spacer penahan tata letak agar konten halaman tidak tertutup header fixed */}
      <div className="h-14 md:h-[72px] w-full shrink-0 pointer-events-none" aria-hidden="true" />
    </>
  );
};

export default NavBar;

