"use client";

import React, { useState, useEffect, useRef } from "react";
import { NoteItem, fetchRoomNotes, sendRoomNote, clearRoomNotes, supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { Send, Trash2, X, RefreshCw, FileEdit } from "lucide-react";

interface StealthNotepadProps {
  roomCode: string;
  onClose: () => void;
}

export const StealthNotepad: React.FC<StealthNotepadProps> = ({ roomCode, onClose }) => {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const notesEndRef = useRef<HTMLDivElement>(null);

  // Load initial notes & configure Realtime WebSocket
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      const data = await fetchRoomNotes(roomCode);
      if (isMounted) {
        setNotes(data);
        setLoading(false);
      }
    }

    loadData();

    // Supabase Realtime Subscription (Instant live update when other party writes)
    let channel: any = null;
    if (isSupabaseConfigured && supabase) {
      channel = supabase
        .channel(`room:${roomCode}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "stealth_notes",
            filter: `room_code=eq.${roomCode}`,
          },
          (payload) => {
            const newRecord = payload.new as NoteItem;
            setNotes((prev) => {
              if (prev.some((n) => n.id === newRecord.id)) return prev;
              return [...prev, newRecord];
            });
          }
        )
        .on(
          "postgres_changes",
          {
            event: "DELETE",
            schema: "public",
            table: "stealth_notes",
            filter: `room_code=eq.${roomCode}`,
          },
          () => {
            setNotes([]);
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
  }, [roomCode]);

  // Scroll to bottom when notes change
  useEffect(() => {
    notesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [notes]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || sending) return;

    setSending(true);
    const sent = await sendRoomNote(roomCode, inputText);
    if (sent) {
      setNotes((prev) => {
        if (prev.some((n) => n.id === sent.id)) return prev;
        return [...prev, sent];
      });
      setInputText("");
    }
    setSending(false);
  };

  const handleClear = async () => {
    await clearRoomNotes(roomCode);
    setNotes([]);
    setShowConfirmClear(false);
  };

  const formatNoteTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-130px)] lg:h-[600px] lg:max-h-[80vh] bg-white dark:bg-slate-900 rounded-2xl border border-slate-300 dark:border-slate-800 shadow-lg overflow-hidden transition-all">
      {/* Disguised Header */}
      <div className="bg-slate-100 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 px-3 py-2.5 sm:px-4 flex items-center justify-between shrink-0 transition-colors">
        <div className="flex items-center gap-2">
          <FileEdit className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 leading-none">
              Module Workshop: Discussion Draft
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              Ref: #{roomCode} • Collaborative Scratchpad
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Clear / Wipe Button */}
          {showConfirmClear ? (
            <div className="flex items-center gap-1 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-md px-1.5 py-0.5 text-[11px] text-red-700 dark:text-red-300">
              <span>Wipe?</span>
              <button
                onClick={handleClear}
                className="font-bold underline text-red-800 dark:text-red-300 hover:text-red-900"
              >
                Yes
              </button>
              <button
                onClick={() => setShowConfirmClear(false)}
                className="text-slate-500 dark:text-slate-400 hover:text-slate-700 ml-1"
              >
                No
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowConfirmClear(true)}
              title="Clear scratchpad entries"
              className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Close Scratchpad */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
            title="Minimize to syllabus"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notes Body (Shared Document Surface) */}
      <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3 bg-slate-50/50 dark:bg-slate-950/40 font-sans text-xs sm:text-sm transition-colors">
        {loading ? (
          <div className="h-full flex items-center justify-center text-slate-400 gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span className="text-xs">Loading course notes...</span>
          </div>
        ) : notes.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center px-4">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Scratchpad is blank.</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 max-w-xs">
              Type a note below to start the collaborative discussion draft.
            </p>
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-lg p-2.5 sm:p-3 shadow-2xs space-y-1 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                <span className="text-slate-600 dark:text-slate-300 font-semibold">Study Annotation</span>
                <span>{formatNoteTime(note.created_at)}</span>
              </div>
              <p className="text-slate-800 dark:text-slate-200 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
                {note.content}
              </p>
            </div>
          ))
        )}
        <div ref={notesEndRef} />
      </div>

      {/* Clean Single Input Bar */}
      <form
        onSubmit={handleSend}
        className="p-2 sm:p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 shrink-0 transition-colors"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Append collaborative note... (Enter)"
          className="flex-1 text-xs sm:text-sm px-3 py-2 bg-slate-100 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-850 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-lg border border-transparent focus:border-slate-300 dark:focus:border-slate-700 focus:outline-none transition-all"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || sending}
          className="p-2 rounded-lg bg-slate-800 dark:bg-indigo-600 hover:bg-slate-900 dark:hover:bg-indigo-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
