"use client";

import React, { useState } from "react";
import { Search, ShieldAlert, Sparkles, Sun, Moon } from "lucide-react";

interface AcademicNavbarProps {
  onSearchSubmit: (query: string) => void;
  onPanicTrigger: () => void;
  activeRoom: string | null;
  isDevMode: boolean;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const AcademicNavbar: React.FC<AcademicNavbarProps> = ({
  onSearchSubmit,
  onPanicTrigger,
  activeRoom,
  isDevMode,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const [searchValue, setSearchValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit(searchValue.trim());
    setSearchValue("");
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-3 py-2.5 sm:px-6 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand / Camouflage Logo (Tapping TC triggers panic on mobile) */}
        <div 
          onClick={onPanicTrigger}
          className="flex items-center gap-2 cursor-pointer select-none shrink-0"
          title="Course Reference Hub (Tap to reset)"
        >
          <div className="w-8 h-8 rounded-lg bg-slate-800 dark:bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            TC
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-semibold text-slate-800 dark:text-slate-100 tracking-tight leading-tight">
              TechComm Hub
            </h1>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              Course Code: KAS-301 / 401
            </p>
          </div>
        </div>

        {/* Search Bar (The Stealth Command Trigger) */}
        <form onSubmit={handleSubmit} className="flex-1 max-w-xl mx-auto">
          <div className="relative flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search syllabus, report formats, or enter code..."
              autoCapitalize="none"
              autoComplete="off"
              spellCheck="false"
              className="w-full pl-9 pr-16 py-1.5 sm:py-2 text-xs sm:text-sm bg-slate-100 dark:bg-slate-800 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 focus:bg-white dark:focus:bg-slate-850 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-full border border-transparent focus:border-slate-300 dark:focus:border-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400/20 transition-all"
            />
            <button
              type="submit"
              className="absolute right-1.5 px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-650 border border-slate-200 dark:border-slate-600 rounded-full shadow-2xs transition-colors"
            >
              Enter
            </button>
          </div>
        </form>

        {/* Status & Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {activeRoom && (
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Doc: {activeRoom}</span>
            </div>
          )}

          {isDevMode && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-[11px] font-semibold">
              <Sparkles className="w-3 h-3" />
              <span>Dev Active</span>
            </div>
          )}

          {/* Dark Mode Toggle */}
          <button
            type="button"
            onClick={onToggleDarkMode}
            aria-label="Toggle Reading Theme"
            title={isDarkMode ? "Switch to Light Theme" : "Switch to Dark Theme"}
            className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* Discreet Panic Button */}
          <button
            type="button"
            onClick={onPanicTrigger}
            aria-label="Reset View"
            title="Instant Reset / Clear Screen (ESC)"
            className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1"
          >
            <ShieldAlert className="w-4 h-4 text-slate-400" />
            <span className="hidden sm:inline font-mono text-[11px]">ESC</span>
          </button>
        </div>
      </div>
    </header>
  );
};
