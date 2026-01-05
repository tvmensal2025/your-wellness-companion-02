export type DifficultyTone = "easy" | "medium" | "hard" | "unknown";

export function normalizeKey(input: string): string {
  return (input || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    // remove diacritics
    .replace(/\p{Diacritic}/gu, "")
    // collapse spaces
    .replace(/\s+/g, " ");
}

export function parseActivityTitle(activity: string): string {
  const raw = String(activity || "");

  // Remove parenthetical notes and common set/rep fragments.
  const cleaned = raw
    .replace(/\(.*?\)/g, " ")
    .replace(/\b\d+\s*(?:x|×)\s*\d+(?:\s*-\s*\d+)?\b/gi, " ")
    .replace(/\b(?:reps?|repeti(c|ç)oes|s(e|é)ries|sets)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Keep original casing (but trim). If empty, fallback to raw.
  return cleaned || raw.trim();
}

export function formatDifficulty(raw?: string | null): { label: string; tone: DifficultyTone } {
  const v = normalizeKey(raw || "");

  if (!v) return { label: "", tone: "unknown" };

  // Canonical easy/medium/hard
  if (v === "facil" || v === "f\u00e1cil" || v.includes("inic")) {
    return { label: "Facil", tone: "easy" };
  }
  if (v === "medio" || v === "m\u00e9dio" || v.includes("inter")) {
    return { label: "Medio", tone: "medium" };
  }
  if (v === "dificil" || v === "dif\u00edcil" || v.includes("avan") || v.includes("hard")) {
    return { label: "Dificil", tone: "hard" };
  }

  // Fallback keeps the original string
  return { label: String(raw), tone: "unknown" };
}

export function extractYouTubeId(videoUrl?: string | null): string | null {
  const raw = String(videoUrl || "");
  if (!raw) return null;

  const match = raw.match(/https?:\/\/[\w./?=&%-]+/i);
  if (!match) return null;

  try {
    const url = new URL(match[0]);
    if (url.hostname.includes("youtube.com")) return url.searchParams.get("v");
    if (url.hostname.includes("youtu.be")) return url.pathname.replace("/", "");
    return null;
  } catch {
    return null;
  }
}
