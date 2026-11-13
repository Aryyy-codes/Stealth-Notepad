"use client";

import React, { useState, useEffect } from "react";
import { 
  fetchAppSettings, 
  updateAppSettings, 
  fetchAllGlobalNotes, 
  fetchAllRooms,
  clearRoomNotes,
  NoteItem, 
  AppSettings,
  isSupabaseConfigured 
} from "@/lib/supabaseClient";
import { getCurrentWeekday } from "@/lib/roomAuth";
import { 
  ShieldCheck, 
  Settings, 
  MessageSquare, 
  Trash2, 
  RefreshCw, 
  X, 
  CheckCircle,
  KeyRound,
  Layers
} from "lucide-react";

interface DeveloperPanelProps {
  onClose: () => void;
}

export const DeveloperPanel: React.FC<DeveloperPanelProps> = ({ onClose }) => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [overrideInput, setOverrideInput] = useState("");
  const [globalNotes, setGlobalNotes] = useState<NoteItem[]>([]);
  const [allRooms, setAllRooms] = useState<string[]>(["TECH-COMM-ALPHA"]);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"settings" | "chats">("settings");

  useEffect(() => {
    loadAllDevData();
  }, []);

  const loadAllDevData = async () => {
    setLoading(true);
    const [cfg, notes, rooms] = await Promise.all([
      fetchAppSettings(),
      fetchAllGlobalNotes(),
      fetchAllRooms(),
    ]);
    setSettings(cfg);
    setOverrideInput(cfg.custom_daily_override || "");
    setGlobalNotes(notes);
    
    // Combine registered rooms with any rooms present in notes
    const combinedRooms = Array.from(new Set([...rooms, ...notes.map((n) => n.room_code)]));
    if (!combinedRooms.includes("TECH-COMM-ALPHA")) {
      combinedRooms.unshift("TECH-COMM-ALPHA");
    }
    setAllRooms(combinedRooms);
    setLoading(false);
  };

  const handleSaveOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    const valueToSave = overrideInput.trim() ? overrideInput.trim().toUpperCase() : null;
    const ok = await updateAppSettings(valueToSave);
    if (ok) {
      setSettings((prev) => prev ? { ...prev, custom_daily_override: valueToSave } : null);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    }
    setSavingSettings(false);
  };

  const handleResetToAuto = async () => {
    setSavingSettings(true);
    const ok = await updateAppSettings(null);
    if (ok) {
      setSettings((prev) => prev ? { ...prev, custom_daily_override: null } : null);
      setOverrideInput("");
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    }
    setSavingSettings(false);
  };

  const handleWipeRoom = async (roomCode: string) => {
    if (confirm(`Are you sure you want to completely wipe all notes in room: "${roomCode}"?`)) {
      await clearRoomNotes(roomCode);
      setGlobalNotes((prev) => prev.filter((n) => n.room_code !== roomCode));
    }
  };

  const currentDay = getCurrentWeekday();
  const effectiveDayKey = settings?.custom_daily_override || currentDay;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header (Master Developer Control) */}
        <div className="bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-slate-900 border-b border-slate-800 px-4 py-3.5 sm:px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Master Developer Control Center
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  ROOT ACCESS
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Logged in as Master Admin • Full Database & Room Control
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadAllDevData}
              title="Refresh Data"
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-950/50 border-b border-slate-800/80 px-4 sm:px-6 flex gap-4 text-xs font-medium shrink-0">
          <button
            onClick={() => setActiveTab("settings")}
            className={`py-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === "settings"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Passcode & Room Controls</span>
          </button>
          <button
            onClick={() => setActiveTab("chats")}
            className={`py-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === "chats"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Global All-Chat Stream ({globalNotes.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {activeTab === "settings" ? (
            <div className="space-y-6">
              {/* Daily Passcode Configuration Card */}
              <div className="p-4 sm:p-5 rounded-xl bg-slate-800/50 border border-slate-700/80 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-indigo-400" />
                      <span>Daily Permanent Room Key</span>
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      By default, today&apos;s passcode is the day in CAPS (e.g. &quot;{currentDay}&quot;). You can override this with any secret custom word below.
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] uppercase font-mono text-slate-400 block">Current Active Key</span>
                    <span className="font-mono text-sm sm:text-base font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-800/80 inline-block mt-0.5">
                      {effectiveDayKey}
                    </span>
                  </div>
                </div>

                <form onSubmit={handleSaveOverride} className="flex flex-col sm:flex-row gap-2.5 pt-2">
                  <input
                    type="text"
                    value={overrideInput}
                    onChange={(e) => setOverrideInput(e.target.value)}
                    placeholder="Enter custom daily pass (or leave blank for AUTO)..."
                    className="flex-1 px-3 py-2 text-xs sm:text-sm bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono uppercase"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={savingSettings}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      {savingSettings ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : saveSuccess ? (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-300" />
                      ) : null}
                      <span>{saveSuccess ? "Saved!" : "Update Passcode"}</span>
                    </button>
                    {(settings?.custom_daily_override || overrideInput) && (
                      <button
                        type="button"
                        onClick={handleResetToAuto}
                        disabled={savingSettings}
                        className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs transition-colors"
                      >
                        Reset to Auto
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Room Management Overview */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                    <span>Active Rooms ({allRooms.length})</span>
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Database Mode: {isSupabaseConfigured ? "Connected (Supabase)" : "Local Fallback"}
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  {allRooms.map((room) => {
                    const roomNotesCount = globalNotes.filter((n) => n.room_code === room).length;
                    return (
                      <div
                        key={room}
                        className="p-3 rounded-lg bg-slate-800/40 border border-slate-700 flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm text-indigo-300">
                              #{room}
                            </span>
                            {room === "TECH-COMM-ALPHA" && (
                              <span className="px-1.5 py-0.5 text-[9px] bg-emerald-500/20 text-emerald-300 rounded font-mono">
                                PRIMARY
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {roomNotesCount} total notes logged
                          </p>
                        </div>
                        <button
                          onClick={() => handleWipeRoom(room)}
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                          title="Purge all notes in this room"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* Global All-Chat Viewer */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">Global Message Feed</h3>
                  <p className="text-xs text-slate-400">
                    Live raw feed across all active rooms (Descending order).
                  </p>
                </div>
              </div>

              {globalNotes.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  No messages found in any room.
                </div>
              ) : (
                <div className="space-y-2">
                  {globalNotes.map((note) => (
                    <div
                      key={note.id}
                      className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex flex-col gap-1.5"
                    >
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">
                            #{note.room_code}
                          </span>
                          <span className="text-slate-300">{note.author_tag}</span>
                        </div>
                        <span>{new Date(note.created_at).toLocaleString()}</span>
                      </div>
                      <p className="text-slate-200 text-xs sm:text-sm whitespace-pre-wrap font-sans">
                        {note.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
