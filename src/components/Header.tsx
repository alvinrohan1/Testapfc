import React, { useState, useEffect } from 'react';
import {
  Maximize2,
  Minimize2,
  Sun,
  Moon,
  Smartphone,
  Settings,
  Wifi,
  WifiOff,
  Bookmark,
  AlertTriangle,
  Play
} from 'lucide-react';
import { requestFullscreen, exitFullscreen, isFullscreen } from '../utils/fullscreen.ts';

interface HeaderProps {
  onOpenSettings: () => void;
  onOpenApkModal: () => void;
  onOpenQuestionBank: (tab: 'incorrect' | 'bookmarks') => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  activeTestTitle?: string;
  onReturnToActiveTest?: () => void;
  incorrectCount: number;
  bookmarkCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSettings,
  onOpenApkModal,
  onOpenQuestionBank,
  isDarkMode,
  onToggleTheme,
  activeTestTitle,
  onReturnToActiveTest,
  incorrectCount,
  bookmarkCount
}) => {
  const [fullscreenActive, setFullscreenActive] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const checkFullscreen = () => setFullscreenActive(isFullscreen());
    document.addEventListener('fullscreenchange', checkFullscreen);
    document.addEventListener('webkitfullscreenchange', checkFullscreen);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      document.removeEventListener('fullscreenchange', checkFullscreen);
      document.removeEventListener('webkitfullscreenchange', checkFullscreen);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleToggleFullscreen = async () => {
    if (fullscreenActive) {
      await exitFullscreen();
      setFullscreenActive(false);
    } else {
      await requestFullscreen();
      setFullscreenActive(true);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-slate-900/95 dark:bg-slate-950/95 border-b border-slate-800 transition-colors">
      <div className="max-w-4xl mx-auto px-3 py-2 flex items-center justify-between gap-2">
        {/* Logo & App Title */}
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-md shadow-sky-500/20 shrink-0">
            <span className="font-extrabold text-white text-[10px] tracking-wider">APFC</span>
          </div>
          <div className="flex items-center gap-1 min-w-0">
            <h1 className="font-bold text-xs xs:text-sm text-white tracking-tight whitespace-nowrap">
              APFC Smart Test
            </h1>
            {isOnline ? (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" title="Online: AI Ready" />
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" title="Offline: Ready" />
            )}
          </div>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Active Test Pill */}
          {activeTestTitle && onReturnToActiveTest && (
            <button
              onClick={onReturnToActiveTest}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/40 text-[11px] font-bold hover:bg-sky-500/30 animate-pulse transition"
              title="Resume active test in progress"
              aria-label="Resume active test"
            >
              <Play className="w-2.5 h-2.5 fill-current" />
              <span>Resume</span>
            </button>
          )}

          {/* Errors Bank Quick Action */}
          <button
            onClick={() => onOpenQuestionBank('incorrect')}
            className="relative p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
            title="Review Incorrect Answers"
            aria-label="Incorrect Answers"
          >
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            {incorrectCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1 min-w-[15px] h-3.5 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center">
                {incorrectCount > 99 ? '99+' : incorrectCount}
              </span>
            )}
          </button>

          {/* Bookmarks */}
          <button
            onClick={() => onOpenQuestionBank('bookmarks')}
            className="relative p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
            title="Saved Bookmarks"
            aria-label="Bookmarks"
          >
            <Bookmark className="w-4 h-4 text-amber-400" />
            {bookmarkCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1 min-w-[15px] h-3.5 rounded-full bg-amber-600 text-white text-[9px] font-bold flex items-center justify-center">
                {bookmarkCount > 99 ? '99+' : bookmarkCount}
              </span>
            )}
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={handleToggleFullscreen}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
            title={fullscreenActive ? 'Exit Fullscreen' : 'Enter Immersive Fullscreen'}
            aria-label="Toggle Fullscreen"
          >
            {fullscreenActive ? <Minimize2 className="w-4 h-4 text-sky-400" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-slate-300" />}
          </button>

          {/* APK Hub Button */}
          <button
            onClick={onOpenApkModal}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 text-xs font-bold transition"
            title="Install APK / Android App"
            aria-label="Install APK"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px]">APK</span>
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
            title="Settings"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
