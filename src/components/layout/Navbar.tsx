import React, { useState, useEffect } from 'react';
import { CheckSquare, HelpCircle, Maximize2, Minimize2, ExternalLink } from 'lucide-react';

interface NavbarProps {
  onOpenAbout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAbout }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    try {
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch((err) => {
            console.warn('Fullscreen request failed:', err);
          });
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch((err) => {
            console.warn('Exit fullscreen failed:', err);
          });
        }
      }
    } catch (e) {
      console.warn('Fullscreen error:', e);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 py-3 shadow-xs">
      {/* Brand / Logo */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
          <CheckSquare className="h-5 w-5 stroke-[2.2]" />
        </div>
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold tracking-tight text-slate-900">Task Manager</h1>
          <span className="hidden md:inline-block text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
            ระบบบริหารจัดการงาน
          </span>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Fullscreen Button ("เต็มจอคอม") */}
        <button
          id="toggle-fullscreen-btn"
          onClick={toggleFullscreen}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 text-slate-700 hover:text-indigo-700 text-xs font-semibold transition-all shadow-2xs active:scale-[0.98]"
          title={isFullscreen ? 'ออกจากโหมดเต็มจอ (Esc)' : 'แสดงผลเต็มจอคอมพิวเตอร์'}
        >
          {isFullscreen ? (
            <>
              <Minimize2 className="h-4 w-4 text-indigo-600" />
              <span className="hidden sm:inline">ย่อขนาด</span>
            </>
          ) : (
            <>
              <Maximize2 className="h-4 w-4 text-indigo-600" />
              <span>เต็มจอคอม</span>
            </>
          )}
        </button>

        {/* Open in New Tab for true browser fullscreen */}
        <a
          id="open-new-tab-btn"
          href={window.location.href}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600 hover:text-slate-900 text-xs font-medium transition shadow-2xs"
          title="เปิดเว็บแอปในแท็บใหม่เต็มหน้าจอ"
        >
          <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
          <span className="hidden md:inline">เปิดแท็บใหม่</span>
        </a>

        {/* เกี่ยวกับ (About) */}
        <button
          id="header-about-btn"
          onClick={onOpenAbout}
          className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors px-2 py-1.5 rounded-lg hover:bg-slate-50"
          title="เกี่ยวกับระบบ"
        >
          <HelpCircle className="h-4 w-4 text-slate-500" />
          <span className="hidden sm:inline">เกี่ยวกับ</span>
        </button>

        {/* User Avatar "A" */}
        <div className="flex items-center pl-2 border-l border-slate-200 shrink-0">
          <div
            className="flex h-8 w-8 min-w-[32px] min-h-[32px] shrink-0 aspect-square items-center justify-center rounded-full bg-purple-600 text-sm font-bold text-white shadow-xs select-none"
            title="ผู้ดูแลระบบ (Admin)"
          >
            A
          </div>
        </div>
      </div>
    </header>
  );
};
