import { useState } from "react";
import { Link } from "wouter";
import {
  getLeaderboard,
  clearLeaderboard,
  type LeaderboardEntry,
} from "@/lib/leaderboard";

const DIFFICULTY_CFG = {
  easy: { label: "Easy", emoji: "🌟", color: "#40c870" },
  hard: { label: "Hard", emoji: "💀", color: "#ff4444" },
} as const;

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function Medal({ rank }: { rank: number }) {
  if (rank === 1) return <span style={{ fontSize: "1.3rem" }}>🥇</span>;
  if (rank === 2) return <span style={{ fontSize: "1.3rem" }}>🥈</span>;
  if (rank === 3) return <span style={{ fontSize: "1.3rem" }}>🥉</span>;
  return (
    <span
      style={{
        display: "inline-block",
        width: 28,
        height: 28,
        lineHeight: "28px",
        textAlign: "center",
        background: "rgba(255,255,255,0.06)",
        borderRadius: "50%",
        fontSize: "0.85rem",
        color: "#7a90bb",
      }}
    >
      {rank}
    </span>
  );
}

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>(() =>
    getLeaderboard()
  );
  const [confirming, setConfirming] = useState(false);

  function handleClear() {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    clearLeaderboard();
    setEntries([]);
    setConfirming(false);
  }

  const pageStyle: React.CSSProperties = {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #050712, #111b3d 50%, #12061f)",
    padding: "32px 16px 48px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 24,
  };

  const cardStyle: React.CSSProperties = {
    width: "100%",
    maxWidth: 640,
    padding: "24px",
    borderRadius: 20,
    background: "rgba(10,16,44,0.82)",
    border: "1px solid rgba(149,194,255,0.3)",
    boxShadow: "0 0 30px rgba(76,108,255,0.25)",
  };

  return (
    <main style={pageStyle}>
      <style>{`
        @keyframes shimmer {
          0%   { opacity: 0.7; }
          50%  { opacity: 1; }
          100% { opacity: 0.7; }
        }
      `}</style>

      {/* Header */}
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            color: "#9bcaff",
            letterSpacing: 3,
            textTransform: "uppercase",
            fontSize: "0.78rem",
            marginBottom: 4,
          }}
        >
          Hall of Champions
        </div>
        <h1
          style={{
            fontSize: "clamp(2rem, 6vw, 3.4rem)",
            color: "white",
            textShadow: "0 0 24px rgba(105,93,255,0.8)",
            fontFamily: "Georgia, serif",
          }}
        >
          🏆 Leaderboard
        </h1>
      </div>

      {/* Table */}
      <div style={cardStyle}>
        {entries.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px 0",
              color: "#5a6a99",
              fontFamily: "Georgia, serif",
              fontSize: "1rem",
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: 12 }}>⚔️</div>
            <p>No scores yet.</p>
            <p style={{ marginTop: 6 }}>
              Win a battle to claim your place here!
            </p>
          </div>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontFamily: "Georgia, serif",
            }}
          >
            <thead>
              <tr>
                {["#", "Hero", "Score", "Mode", "Date"].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: h === "#" || h === "Score" ? "center" : "left",
                      padding: "8px 10px",
                      fontSize: "0.75rem",
                      letterSpacing: 2,
                      textTransform: "uppercase",
                      color: "#5a6a99",
                      borderBottom: "1px solid rgba(149,194,255,0.15)",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, i) => {
                const dcfg = DIFFICULTY_CFG[entry.difficulty];
                const isTop3 = i < 3;
                return (
                  <tr
                    key={i}
                    style={{
                      background:
                        i === 0
                          ? "rgba(255,210,80,0.06)"
                          : i % 2 === 0
                          ? "rgba(255,255,255,0.02)"
                          : "transparent",
                      transition: "background 0.15s",
                    }}
                  >
                    <td
                      style={{
                        padding: "13px 10px",
                        textAlign: "center",
                        borderBottom: "1px solid rgba(149,194,255,0.08)",
                      }}
                    >
                      <Medal rank={i + 1} />
                    </td>
                    <td
                      style={{
                        padding: "13px 10px",
                        color: isTop3 ? "#e8f0ff" : "#b0bcd8",
                        fontWeight: isTop3 ? "bold" : "normal",
                        fontSize: "0.95rem",
                        borderBottom: "1px solid rgba(149,194,255,0.08)",
                        maxWidth: 160,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {entry.name}
                    </td>
                    <td
                      style={{
                        padding: "13px 10px",
                        textAlign: "center",
                        color: isTop3 ? "#ffd97a" : "#a0b0cc",
                        fontWeight: isTop3 ? "bold" : "normal",
                        fontSize: isTop3 ? "1.05rem" : "0.95rem",
                        borderBottom: "1px solid rgba(149,194,255,0.08)",
                      }}
                    >
                      ⭐ {entry.score}
                    </td>
                    <td
                      style={{
                        padding: "13px 10px",
                        borderBottom: "1px solid rgba(149,194,255,0.08)",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-block",
                          padding: "2px 8px",
                          borderRadius: 999,
                          background: `${dcfg.color}20`,
                          border: `1px solid ${dcfg.color}60`,
                          color: dcfg.color,
                          fontSize: "0.72rem",
                          letterSpacing: 1,
                          textTransform: "uppercase",
                        }}
                      >
                        {dcfg.emoji} {dcfg.label}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "13px 10px",
                        color: "#5a6a99",
                        fontSize: "0.82rem",
                        borderBottom: "1px solid rgba(149,194,255,0.08)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatDate(entry.date)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Actions */}
      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          justifyContent: "center",
          width: "100%",
          maxWidth: 640,
        }}
      >
        <Link
          href="/battle"
          style={{
            padding: "14px 28px",
            borderRadius: 999,
            background: "linear-gradient(135deg, #8ed2ff, #f5e4ff)",
            color: "#071026",
            textDecoration: "none",
            fontWeight: "bold",
            fontSize: "1rem",
            boxShadow: "0 0 24px rgba(119,189,255,0.6)",
            fontFamily: "Georgia, serif",
          }}
        >
          ⚔️ Enter Battle
        </Link>
        <Link
          href="/"
          style={{
            padding: "14px 28px",
            borderRadius: 999,
            border: "1px solid rgba(149,194,255,0.3)",
            background: "rgba(20,30,70,0.8)",
            color: "#9bcaff",
            textDecoration: "none",
            fontWeight: "bold",
            fontSize: "1rem",
            fontFamily: "Georgia, serif",
          }}
        >
          ← Home
        </Link>
        {entries.length > 0 && (
          <button
            onClick={handleClear}
            style={{
              padding: "14px 24px",
              borderRadius: 999,
              border: confirming
                ? "1px solid #ff4444"
                : "1px solid rgba(149,194,255,0.15)",
              background: confirming
                ? "rgba(200,30,30,0.25)"
                : "rgba(10,16,44,0.6)",
              color: confirming ? "#ff8080" : "#4a5a80",
              fontWeight: "bold",
              fontSize: "0.9rem",
              cursor: "pointer",
              fontFamily: "Georgia, serif",
              transition: "all 0.2s",
            }}
          >
            {confirming ? "⚠️ Confirm Clear" : "🗑 Clear Scores"}
          </button>
        )}
        {confirming && (
          <button
            onClick={() => setConfirming(false)}
            style={{
              padding: "14px 20px",
              borderRadius: 999,
              border: "1px solid rgba(149,194,255,0.2)",
              background: "rgba(10,16,44,0.6)",
              color: "#7a90bb",
              fontWeight: "bold",
              fontSize: "0.9rem",
              cursor: "pointer",
              fontFamily: "Georgia, serif",
            }}
          >
            Cancel
          </button>
        )}
      </div>
    </main>
  );
}
