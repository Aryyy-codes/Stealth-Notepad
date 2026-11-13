export const DEV_PASSPHRASE = "Aryan is Aryyy";

export interface ResolvedCommand {
  type: "DEVELOPER_MODE" | "PERMANENT_ROOM" | "CREATE_ROOM" | "JOIN_ROOM" | "ACADEMIC_SEARCH";
  roomCode?: string;
  searchTerm?: string;
}

export function getCurrentWeekday(): string {
  return new Date().toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();
}

/**
 * Parses user input entered into the search bar.
 * @param input The text query from the user.
 * @param customDayOverride Optional override configured in Master Control.
 */
export function parseSearchCommand(input: string, customDayOverride?: string | null): ResolvedCommand {
  const clean = input.trim();
  if (!clean) return { type: "ACADEMIC_SEARCH", searchTerm: "" };

  // 1. Master Developer Control Panel (Case-insensitive for mobile typing convenience)
  if (clean.toLowerCase() === DEV_PASSPHRASE.toLowerCase()) {
    return { type: "DEVELOPER_MODE" };
  }

  // Normalize key by stripping optional leading '#' or 'ROOM:' prefix
  const normalizedKey = clean.replace(/^(?:#|ROOM:\s*)/i, "").trim().toUpperCase();

  // 2. Daily Permanent Room Key (e.g. "MONDAY" or custom override set by Master Control)
  const activeDayKey = (customDayOverride && customDayOverride.trim() !== "AUTO" && customDayOverride.trim() !== "")
    ? customDayOverride.trim().toUpperCase()
    : getCurrentWeekday();

  if (normalizedKey === activeDayKey || normalizedKey === "TECH-COMM-ALPHA") {
    return {
      type: "PERMANENT_ROOM",
      roomCode: "TECH-COMM-ALPHA",
    };
  }

  // 3. Dynamic Room Creation (e.g. "CREATE PYQ" or "NEW PYQ")
  const createMatch = clean.match(/^(?:CREATE|NEW)\s+([A-Za-z0-9_-]+)$/i);
  if (createMatch) {
    return {
      type: "CREATE_ROOM",
      roomCode: createMatch[1].toUpperCase(),
    };
  }

  // 4. Join Specific Room (e.g. "#PYQ" or "ROOM:PYQ")
  const joinMatch = clean.match(/^(?:#|ROOM:\s*)([A-Za-z0-9_-]+)$/i);
  if (joinMatch) {
    return {
      type: "JOIN_ROOM",
      roomCode: joinMatch[1].toUpperCase(),
    };
  }

  // 5. Standard Academic Search (e.g. "memos", "7 Cs", "barriers")
  return {
    type: "ACADEMIC_SEARCH",
    searchTerm: clean,
  };
}
