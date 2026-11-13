import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith("https://")
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export interface NoteItem {
  id: string;
  room_code: string;
  author_tag: string;
  content: string;
  created_at: string;
}

export interface AppSettings {
  id: string;
  active_daily_code: string;
  custom_daily_override: string | null;
  permanent_room_code: string;
}

// In-Memory Fallback Cache (Ensures full functionality when offline or before Supabase keys are entered)
let mockNotesCache: NoteItem[] = [
  {
    id: "initial-1",
    room_code: "TECH-COMM-ALPHA",
    author_tag: "Author 1",
    content: "Reviewing Module 2: Key guidelines for technical memos.",
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "initial-2",
    room_code: "TECH-COMM-ALPHA",
    author_tag: "Author 2",
    content: "Understood. Action items and deadlines noted.",
    created_at: new Date(Date.now() - 1800000).toISOString(),
  }
];

let mockRoomsCache: string[] = ["TECH-COMM-ALPHA"];

let mockSettings: AppSettings = {
  id: "primary_config",
  active_daily_code: "AUTO",
  custom_daily_override: null,
  permanent_room_code: "TECH-COMM-ALPHA",
};

/**
 * Fetch notes for a specific room.
 */
export async function fetchRoomNotes(roomCode: string): Promise<NoteItem[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("stealth_notes")
        .select("*")
        .eq("room_code", roomCode)
        .order("created_at", { ascending: true });

      if (!error && data) {
        return data as NoteItem[];
      }
    } catch (err) {
      console.warn("Supabase fetch failed, falling back to local memory:", err);
    }
  }

  return mockNotesCache.filter((n) => n.room_code === roomCode);
}

/**
 * Ensure a room exists in stealth_rooms before inserting notes (prevents FK violation)
 */
export async function ensureRoomExists(roomCode: string): Promise<void> {
  if (!mockRoomsCache.includes(roomCode)) {
    mockRoomsCache.push(roomCode);
  }

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from("stealth_rooms").upsert(
        { 
          room_code: roomCode, 
          is_permanent: roomCode === "TECH-COMM-ALPHA",
          last_activity: new Date().toISOString()
        },
        { onConflict: "room_code", ignoreDuplicates: false }
      );
    } catch (err) {
      console.warn("Could not ensure room exists:", err);
    }
  }
}

/**
 * Send a new note to a room.
 */
export async function sendRoomNote(roomCode: string, content: string, authorTag: string = "Author"): Promise<NoteItem | null> {
  const newNote: NoteItem = {
    id: "note-" + Math.random().toString(36).substring(2, 9),
    room_code: roomCode,
    author_tag: authorTag,
    content: content.trim(),
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      // Auto-create room in stealth_rooms if it doesn't exist (prevents FK constraint error)
      await ensureRoomExists(roomCode);
      const { data, error } = await supabase
        .from("stealth_notes")
        .insert({
          room_code: roomCode,
          author_tag: authorTag,
          content: content.trim(),
        })
        .select()
        .single();

      if (!error && data) {
        return data as NoteItem;
      }
    } catch (err) {
      console.warn("Supabase insert failed, using local memory:", err);
    }
  }

  mockNotesCache.push(newNote);
  return newNote;
}

/**
 * Fetch application settings (Active Day Key / Overrides)
 */
export async function fetchAppSettings(): Promise<AppSettings> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("stealth_settings")
        .select("*")
        .eq("id", "primary_config")
        .single();

      if (!error && data) {
        return data as AppSettings;
      }
    } catch (err) {
      console.warn("Could not fetch settings from Supabase:", err);
    }
  }
  return mockSettings;
}

/**
 * Update application settings from the Master Developer Panel
 */
export async function updateAppSettings(customOverride: string | null): Promise<boolean> {
  mockSettings.custom_daily_override = customOverride;

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from("stealth_settings")
        .update({
          custom_daily_override: customOverride,
          updated_at: new Date().toISOString(),
        })
        .eq("id", "primary_config");

      return !error;
    } catch (err) {
      console.error("Failed to update settings in Supabase:", err);
      return false;
    }
  }

  return true;
}

/**
 * Clear/burn all notes in a specific room
 */
export async function clearRoomNotes(roomCode: string): Promise<boolean> {
  mockNotesCache = mockNotesCache.filter((n) => n.room_code !== roomCode);

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from("stealth_notes")
        .delete()
        .eq("room_code", roomCode);

      return !error;
    } catch (err) {
      console.error("Failed to clear notes in Supabase:", err);
      return false;
    }
  }

  return true;
}

/**
 * Master Developer function: Fetch all notes across all rooms
 */
export async function fetchAllGlobalNotes(): Promise<NoteItem[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("stealth_notes")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        return data as NoteItem[];
      }
    } catch (err) {
      console.warn("Could not fetch all notes from Supabase:", err);
    }
  }

  return [...mockNotesCache].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

/**
 * Fetch all registered rooms (for Developer Panel)
 */
export async function fetchAllRooms(): Promise<string[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("stealth_rooms")
        .select("room_code")
        .order("created_at", { ascending: false });

      if (!error && data) {
        const rooms = data.map((r: { room_code: string }) => r.room_code);
        if (!rooms.includes("TECH-COMM-ALPHA")) {
          rooms.unshift("TECH-COMM-ALPHA");
        }
        return rooms;
      }
    } catch (err) {
      console.warn("Could not fetch rooms from Supabase:", err);
    }
  }

  return mockRoomsCache;
}
