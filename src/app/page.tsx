"use client";

import React, { useState, useEffect } from "react";
import { AcademicNavbar } from "@/components/AcademicNavbar";
import { SyllabusViewer } from "@/components/SyllabusViewer";
import { StealthNotepad } from "@/components/StealthNotepad";
import { DeveloperPanel } from "@/components/DeveloperPanel";
import { parseSearchCommand, ResolvedCommand } from "@/lib/roomAuth";
import { fetchAppSettings, ensureRoomExists, supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { BookOpen, Edit3, Info } from "lucide-react";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [isDevMode, setIsDevMode] = useState(false);
  const [mobileTab, setMobileTab] = useState<"syllabus" | "notepad">("syllabus");
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);
  const [customDayOverride, setCustomDayOverride] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Load theme preference on mount & sync to <html> element
  useEffect(() => {
    const savedTheme = localStorage.getItem("tc_theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldBeDark = savedTheme === "dark" || (!savedTheme && prefersDark);
    
    setIsDarkMode(shouldBeDark);
    if (shouldBeDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem("tc_theme", next ? "dark" : "light");
      if (next) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return next;
    });
  };

  // Load app settings on mount & subscribe to Realtime updates for live passcode changes
  useEffect(() => {
    let isMounted = true;

    async function initSettings() {
      const cfg = await fetchAppSettings();
      if (isMounted) {
        setCustomDayOverride(cfg.custom_daily_override);
      }
    }
    initSettings();

    let channel: any = null;
    if (isSupabaseConfigured && supabase) {
      channel = supabase
        .channel("app_settings_sync")
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "stealth_settings",
            filter: "id=eq.primary_config",
          },
          (payload) => {
            const newRecord = payload.new as { custom_daily_override: string | null };
            if (newRecord && isMounted) {
              setCustomDayOverride(newRecord.custom_daily_override);
            }
          }
        )
        .subscribe();
    }

    return () => {
      isMounted = false;
      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [isDevMode]);

  // Global ESC Key Listener (Instant Panic Reset)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handlePanic();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handlePanic = () => {
    setActiveRoom(null);
    setIsDevMode(false);
    setMobileTab("syllabus");
    setBannerMessage("Screen reset to syllabus index.");
    setTimeout(() => setBannerMessage(null), 2000);
  };

  const handleSearchSubmit = async (rawInput: string) => {
    const resolved: ResolvedCommand = parseSearchCommand(rawInput, customDayOverride);

    switch (resolved.type) {
      case "DEVELOPER_MODE":
        setIsDevMode(true);
        setBannerMessage("Master Developer Access Granted.");
        setTimeout(() => setBannerMessage(null), 3000);
        break;

      case "PERMANENT_ROOM":
        setActiveRoom(resolved.roomCode || "TECH-COMM-ALPHA");
        setMobileTab("notepad");
        setBannerMessage("Daily Study Discussion Unlocked.");
        setTimeout(() => setBannerMessage(null), 2500);
        break;

      case "CREATE_ROOM":
        const newCode = resolved.roomCode || "GENERAL";
        await ensureRoomExists(newCode);
        setActiveRoom(newCode);
        setMobileTab("notepad");
        setBannerMessage("Created Workshop Draft #" + newCode);
        setTimeout(() => setBannerMessage(null), 2500);
        break;

      case "JOIN_ROOM":
        const targetCode = resolved.roomCode || "GENERAL";
        await ensureRoomExists(targetCode);
        setActiveRoom(targetCode);
        setMobileTab("notepad");
        setBannerMessage("Connected to Workshop Draft #" + targetCode);
        setTimeout(() => setBannerMessage(null), 2500);
        break;

      case "ACADEMIC_SEARCH":
      default:
        setSearchQuery(resolved.searchTerm || "");
        setMobileTab("syllabus");
        break;
    }
  };

  return (
    <div className={isDarkMode ? "dark" : ""}>
      <div className="min-h-[100dvh] flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans selection:bg-slate-200 dark:selection:bg-slate-800 transition-colors">
        {/* Discreet Navigation Bar */}
        <AcademicNavbar
          onSearchSubmit={handleSearchSubmit}
          onPanicTrigger={handlePanic}
          activeRoom={activeRoom}
          isDevMode={isDevMode}
          isDarkMode={isDarkMode}
          onToggleDarkMode={toggleDarkMode}
        />

        {/* Ephemeral Feedback Toast */}
        {bannerMessage && (
          <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 dark:bg-slate-800/90 backdrop-blur-sm text-white text-xs px-3.5 py-1.5 rounded-full shadow-md flex items-center gap-1.5 transition-all">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>{bannerMessage}</span>
          </div>
        )}

        {/* Mobile Tab Switcher */}
        {activeRoom && (
          <div className="lg:hidden sticky top-[57px] z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-2 flex gap-2 transition-colors">
            <button
              onClick={() => setMobileTab("syllabus")}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                mobileTab === "syllabus"
                  ? "bg-slate-800 dark:bg-indigo-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Syllabus Notes</span>
            </button>
            <button
              onClick={() => setMobileTab("notepad")}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                mobileTab === "notepad"
                  ? "bg-slate-800 dark:bg-indigo-600 text-white shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Study Scratchpad</span>
            </button>
          </div>
        )}

        {/* Main Content Body */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8">
          {activeRoom ? (
            /* Dual-Column Split Workspace (Notepad alongside Syllabus on Desktop) */
            <div className="grid lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Syllabus Content */}
              <div
                className={`lg:col-span-7 ${
                  mobileTab === "syllabus" ? "block" : "hidden lg:block"
                }`}
              >
                <SyllabusViewer searchQuery={searchQuery} />
              </div>

              {/* Right Column: Stealth Collaborative Notepad */}
              <div
                className={`lg:col-span-5 sticky top-20 ${
                  mobileTab === "notepad" ? "block" : "hidden lg:block"
                }`}
              >
                <StealthNotepad
                  roomCode={activeRoom}
                  onClose={() => {
                    setActiveRoom(null);
                    setMobileTab("syllabus");
                  }}
                />
              </div>
            </div>
          ) : (
            /* Full Screen Authentic Syllabus View */
            <div className="max-w-4xl mx-auto">
              <SyllabusViewer searchQuery={searchQuery} />
            </div>
          )}
        </main>

        {/* Developer Master Panel (Root Access Unlocked by "Aryan is Aryyy") */}
        {isDevMode && (
          <DeveloperPanel
            onClose={() => setIsDevMode(false)}
          />
        )}

        {/* Academic Disguise Footer */}
        <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-4 px-4 text-center text-xs text-slate-400 dark:text-slate-500 mt-auto transition-colors">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <p>© 2026 Academic Curriculum Archive • Dept. of Applied Sciences & Humanities</p>
            <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400">
              <span>Syllabus Rev: 2026.4</span>
              <span>•</span>
              <span>Accredited Resource</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
