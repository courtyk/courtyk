export interface LeaderboardEntry {
  name: string;
  score: number;
  difficulty: "easy" | "hard";
  date: string;
}

const KEY = "quest-arena-leaderboard";
const MAX_ENTRIES = 10;

export function getLeaderboard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as LeaderboardEntry[];
  } catch {
    return [];
  }
}

export function saveScore(entry: LeaderboardEntry): LeaderboardEntry[] {
  const current = getLeaderboard();
  const updated = [...current, entry]
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_ENTRIES);
  localStorage.setItem(KEY, JSON.stringify(updated));
  return updated;
}

export function getRank(score: number): number {
  const entries = getLeaderboard();
  return entries.filter((e) => e.score > score).length + 1;
}

export function clearLeaderboard(): void {
  localStorage.removeItem(KEY);
}
