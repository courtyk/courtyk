import { useState, useRef } from "react";
import { Link } from "wouter";
import { questions, type Question } from "@/data/questions";
import { saveScore, getRank } from "@/lib/leaderboard";

type Difficulty = "easy" | "hard";
type Phase = "select" | "battle" | "win" | "lose";

const SETTINGS = {
  easy: {
    label: "Easy",
    emoji: "🌟",
    color: "#40c870",
    glowColor: "rgba(64,200,112,0.6)",
    playerMaxHp: 100,
    bossMaxHp: 100,
    bossName: "Goblin King",
    bossEmoji: "👺",
    playerAttack: 30,
    bossAttack: 15,
    scoreMultiplier: 1,
    desc: "Simpler questions · Weaker boss · Great for beginners",
  },
  hard: {
    label: "Hard",
    emoji: "💀",
    color: "#ff4444",
    glowColor: "rgba(255,68,68,0.6)",
    playerMaxHp: 80,
    bossMaxHp: 200,
    bossName: "Shadow Dragon",
    bossEmoji: "🐉",
    playerAttack: 20,
    bossAttack: 30,
    scoreMultiplier: 2,
    desc: "Tough questions · Powerful boss · Double score",
  },
} as const;

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function HealthBar({
  current,
  max,
  color,
  label,
}: {
  current: number;
  max: number;
  color: string;
  label: string;
}) {
  const pct = Math.max(0, (current / max) * 100);
  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 4,
          fontSize: "0.85rem",
          color: "#ccd8ff",
          letterSpacing: 1,
          textTransform: "uppercase",
        }}
      >
        <span>{label}</span>
        <span>
          {Math.max(0, current)}/{max}
        </span>
      </div>
      <div
        style={{
          height: 14,
          background: "rgba(255,255,255,0.1)",
          borderRadius: 7,
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.15)",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: color,
            borderRadius: 7,
            transition: "width 0.4s ease",
            boxShadow: `0 0 8px ${color}`,
          }}
        />
      </div>
    </div>
  );
}

export default function BossBattle() {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [phase, setPhase] = useState<Phase>("select");
  const [pool, setPool] = useState<Question[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [playerHp, setPlayerHp] = useState(100);
  const [bossHp, setBossHp] = useState(100);
  const [feedback, setFeedback] = useState<{
    type: "correct" | "wrong";
    msg: string;
  } | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [locked, setLocked] = useState(false);
  const [heroName, setHeroName] = useState("");
  const [scoreSaved, setScoreSaved] = useState(false);
  const [savedRank, setSavedRank] = useState<number | null>(null);
  const bossRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);

  const cfg = SETTINGS[difficulty];
  const q: Question = pool[qIndex % Math.max(pool.length, 1)];

  function startBattle(diff: Difficulty) {
    const cfg = SETTINGS[diff];
    const filtered = shuffle(
      questions.filter((q) => q.difficulty === diff)
    );
    setDifficulty(diff);
    setPool(filtered);
    setQIndex(0);
    setPlayerHp(cfg.playerMaxHp);
    setBossHp(cfg.bossMaxHp);
    setScore(0);
    setStreak(0);
    setFeedback(null);
    setSelected(null);
    setLocked(false);
    setHeroName("");
    setScoreSaved(false);
    setSavedRank(null);
    setPhase("battle");
  }

  function handleAnswer(idx: number) {
    if (locked || phase !== "battle") return;
    setLocked(true);
    setSelected(idx);

    const isCorrect = idx === q.answer;

    if (isCorrect) {
      const bonus = streak >= 2 ? 10 : 0;
      const dmg = cfg.playerAttack + bonus;
      const nextBossHp = bossHp - dmg;
      setBossHp(nextBossHp);
      setScore((s) => s + (10 + bonus) * cfg.scoreMultiplier);
      setStreak((s) => s + 1);
      setFeedback({
        type: "correct",
        msg:
          streak >= 2
            ? `🔥 Streak Bonus! −${dmg} HP to boss!`
            : `⚔️ Correct! −${dmg} HP to boss!`,
      });
      if (bossRef.current) {
        bossRef.current.style.filter =
          "brightness(2) saturate(2)";
        setTimeout(() => {
          if (bossRef.current) bossRef.current.style.filter = "";
          if (nextBossHp <= 0) {
            setPhase("win");
          }
        }, 400);
      } else if (nextBossHp <= 0) {
        setTimeout(() => setPhase("win"), 400);
      }
    } else {
      const nextPlayerHp = playerHp - cfg.bossAttack;
      setPlayerHp(nextPlayerHp);
      setStreak(0);
      setFeedback({
        type: "wrong",
        msg: `💥 Wrong! Boss strikes back for ${cfg.bossAttack} HP!`,
      });
      if (playerRef.current) {
        playerRef.current.style.animation = "none";
        void playerRef.current.offsetHeight;
        playerRef.current.style.animation = "shake 0.4s ease";
      }
      if (nextPlayerHp <= 0) {
        setTimeout(() => setPhase("lose"), 400);
      }
    }

    setTimeout(() => {
      setFeedback(null);
      setSelected(null);
      setLocked(false);
      setQIndex((i) => i + 1);
    }, 1400);
  }

  const pageStyle: React.CSSProperties = {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #050712, #111b3d 50%, #12061f)",
    padding: "24px 16px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 20,
  };

  const cardStyle: React.CSSProperties = {
    width: "100%",
    maxWidth: 680,
    padding: "20px 24px",
    borderRadius: 20,
    background: "rgba(10,16,44,0.82)",
    border: "1px solid rgba(149,194,255,0.3)",
    boxShadow: "0 0 30px rgba(76,108,255,0.25)",
  };

  return (
    <main style={pageStyle}>
      <style>{`
        @keyframes shake {
          0%,100%{transform:translateX(0)}
          20%{transform:translateX(-8px)}
          40%{transform:translateX(8px)}
          60%{transform:translateX(-6px)}
          80%{transform:translateX(6px)}
        }
        @keyframes float {
          0%,100%{transform:translateY(0)}
          50%{transform:translateY(-8px)}
        }
        @keyframes glow-pulse {
          0%,100%{box-shadow:0 0 20px rgba(142,210,255,0.3)}
          50%{box-shadow:0 0 40px rgba(142,210,255,0.7)}
        }
        @keyframes difficulty-hover-easy {
          0%,100%{box-shadow:0 0 20px rgba(64,200,112,0.3)}
          50%{box-shadow:0 0 40px rgba(64,200,112,0.7)}
        }
        @keyframes difficulty-hover-hard {
          0%,100%{box-shadow:0 0 20px rgba(255,68,68,0.3)}
          50%{box-shadow:0 0 40px rgba(255,68,68,0.7)}
        }
      `}</style>

      {/* Header */}
      <div style={{ textAlign: "center", width: "100%", maxWidth: 680 }}>
        <div
          style={{
            color: "#9bcaff",
            letterSpacing: 3,
            textTransform: "uppercase",
            fontSize: "0.78rem",
            marginBottom: 4,
          }}
        >
          {phase === "select" ? "Choose Your Challenge" : "Boss Battle"}
        </div>
        <h1
          style={{
            fontSize: "clamp(1.8rem, 5vw, 3rem)",
            textShadow: "0 0 20px rgba(105,93,255,0.75)",
            color: "white",
            fontFamily: "Georgia, serif",
          }}
        >
          Quest Arena
        </h1>
      </div>

      {/* ── DIFFICULTY SELECT SCREEN ────────────────────────────────────── */}
      {phase === "select" && (
        <div
          style={{
            width: "100%",
            maxWidth: 680,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <p
            style={{
              textAlign: "center",
              color: "#dbe6ff",
              fontSize: "1.05rem",
              marginBottom: 4,
              fontFamily: "Georgia, serif",
            }}
          >
            Select your difficulty before entering battle:
          </p>

          {/* Boss image preview */}
          <div
            style={{
              borderRadius: 20,
              overflow: "hidden",
              border: "2px solid rgba(160,198,255,0.3)",
              boxShadow: "0 0 40px rgba(120,80,255,0.35)",
              animation: "float 3s ease-in-out infinite",
            }}
          >
            <img
              src="/battle-question.png"
              alt="Boss battle scene"
              style={{ display: "block", width: "100%" }}
            />
          </div>

          {/* Difficulty cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 14,
            }}
          >
            {(["easy", "hard"] as Difficulty[]).map((diff) => {
              const s = SETTINGS[diff];
              const isSelected = difficulty === diff;
              return (
                <button
                  key={diff}
                  onClick={() => setDifficulty(diff)}
                  style={{
                    padding: "20px 16px",
                    borderRadius: 16,
                    background: isSelected
                      ? `rgba(${diff === "easy" ? "40,160,80" : "180,30,30"},0.25)`
                      : "rgba(10,16,44,0.82)",
                    border: isSelected
                      ? `2px solid ${s.color}`
                      : "2px solid rgba(149,194,255,0.2)",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.2s ease",
                    boxShadow: isSelected
                      ? `0 0 20px ${s.glowColor}`
                      : "none",
                  }}
                >
                  <div
                    style={{
                      fontSize: "2rem",
                      marginBottom: 6,
                      lineHeight: 1,
                    }}
                  >
                    {s.emoji}
                  </div>
                  <div
                    style={{
                      color: s.color,
                      fontWeight: "bold",
                      fontSize: "1.15rem",
                      marginBottom: 6,
                      fontFamily: "Georgia, serif",
                    }}
                  >
                    {s.label}
                  </div>
                  <div
                    style={{
                      color: "#9bb0d4",
                      fontSize: "0.8rem",
                      lineHeight: 1.5,
                    }}
                  >
                    {s.desc}
                  </div>
                  <div
                    style={{
                      marginTop: 12,
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                    }}
                  >
                    {[
                      ["Boss HP", s.bossMaxHp],
                      ["Your HP", s.playerMaxHp],
                      ["Your Dmg", s.playerAttack],
                      ["Boss Dmg", s.bossAttack],
                    ].map(([lbl, val]) => (
                      <div
                        key={lbl}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "0.78rem",
                          color: "#7a90bb",
                        }}
                      >
                        <span>{lbl}</span>
                        <span style={{ color: "#ccd8ff" }}>{val}</span>
                      </div>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => startBattle(difficulty)}
            style={{
              padding: "16px",
              borderRadius: 999,
              border: "none",
              background: `linear-gradient(135deg, ${cfg.color}, ${difficulty === "easy" ? "#8ed2ff" : "#ff8040"})`,
              color: difficulty === "easy" ? "#071026" : "white",
              fontWeight: "bold",
              fontSize: "1.1rem",
              cursor: "pointer",
              boxShadow: `0 0 28px ${cfg.glowColor}`,
              transition: "transform 0.2s ease",
              fontFamily: "Georgia, serif",
              animation: "glow-pulse 2s ease-in-out infinite",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.transform =
                "translateY(-3px) scale(1.02)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.transform = "")
            }
          >
            {cfg.emoji} Enter Battle on {cfg.label}
          </button>

          <div style={{ textAlign: "center" }}>
            <Link href="/" style={{ color: "#6090cc", textDecoration: "none", fontSize: "0.9rem" }}>
              ← Back to Landing Page
            </Link>
          </div>
        </div>
      )}

      {/* ── BATTLE SCREEN ───────────────────────────────────────────────── */}
      {phase === "battle" && q && (
        <>
          {/* Score & Streak */}
          <div
            style={{
              display: "flex",
              gap: 20,
              width: "100%",
              maxWidth: 680,
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                padding: "3px 10px",
                borderRadius: 999,
                background:
                  difficulty === "easy"
                    ? "rgba(64,200,112,0.15)"
                    : "rgba(255,68,68,0.15)",
                border: `1px solid ${cfg.color}`,
                color: cfg.color,
                fontSize: "0.78rem",
                letterSpacing: 2,
                textTransform: "uppercase",
              }}
            >
              {cfg.emoji} {cfg.label}
              {difficulty === "hard" && " · 2× Score"}
            </span>
            <div style={{ display: "flex", gap: 16 }}>
              <span style={{ color: "#ffd97a", fontSize: "0.9rem" }}>
                ⭐ {score}
              </span>
              {streak >= 2 && (
                <span style={{ color: "#ff9c4a", fontSize: "0.9rem" }}>
                  🔥 ×{streak}
                </span>
              )}
            </div>
          </div>

          {/* Health Bars */}
          <div style={cardStyle}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <HealthBar
                current={bossHp}
                max={cfg.bossMaxHp}
                color="linear-gradient(90deg, #ff4040, #ff8040)"
                label={`${cfg.bossEmoji} ${cfg.bossName}`}
              />
              <HealthBar
                current={playerHp}
                max={cfg.playerMaxHp}
                color="linear-gradient(90deg, #40c8ff, #7060ff)"
                label="🗡️ Your Hero"
              />
            </div>
          </div>

          {/* Boss Image */}
          <div
            ref={bossRef}
            style={{
              width: "100%",
              maxWidth: 680,
              borderRadius: 20,
              overflow: "hidden",
              border: "2px solid rgba(160,198,255,0.3)",
              boxShadow: "0 0 40px rgba(120,80,255,0.35)",
              transition: "filter 0.2s ease",
              animation: "float 3s ease-in-out infinite",
            }}
          >
            <img
              src="/battle-question.png"
              alt="Boss battle scene"
              style={{ display: "block", width: "100%" }}
            />
          </div>

          {/* Question Card */}
          <div
            ref={playerRef}
            style={{
              ...cardStyle,
              border: "1px solid rgba(142,210,255,0.4)",
            }}
          >
            <div
              style={{
                display: "inline-block",
                padding: "3px 10px",
                borderRadius: 999,
                background:
                  q.subject === "english"
                    ? "rgba(100,180,255,0.2)"
                    : "rgba(255,180,80,0.2)",
                color: q.subject === "english" ? "#8ed2ff" : "#ffd97a",
                fontSize: "0.75rem",
                letterSpacing: 2,
                textTransform: "uppercase",
                marginBottom: 12,
              }}
            >
              {q.subject === "english" ? "📖 English" : "🔢 Math"}
            </div>
            <p
              style={{
                color: "white",
                fontSize: "1.1rem",
                lineHeight: 1.55,
                marginBottom: 18,
                fontFamily: "Georgia, serif",
              }}
            >
              {q.text}
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
              }}
            >
              {q.choices.map((choice, i) => {
                let bg = "rgba(20,28,60,0.9)";
                let border = "1px solid rgba(149,194,255,0.25)";
                let color = "#dce5ff";
                if (selected !== null) {
                  if (i === q.answer) {
                    bg = "rgba(40,180,80,0.3)";
                    border = "1px solid #40c870";
                    color = "#80ffaa";
                  } else if (i === selected && selected !== q.answer) {
                    bg = "rgba(200,40,40,0.3)";
                    border = "1px solid #ff4040";
                    color = "#ffaaaa";
                  }
                }
                return (
                  <button
                    key={i}
                    onClick={() => handleAnswer(i)}
                    disabled={locked}
                    style={{
                      padding: "14px 12px",
                      borderRadius: 12,
                      background: bg,
                      border,
                      color,
                      fontSize: "0.95rem",
                      cursor: locked ? "default" : "pointer",
                      textAlign: "left",
                      lineHeight: 1.4,
                      transition: "all 0.2s ease",
                      fontFamily: "Georgia, serif",
                    }}
                    onMouseEnter={(e) => {
                      if (!locked)
                        (e.currentTarget as HTMLElement).style.background =
                          "rgba(100,140,255,0.25)";
                    }}
                    onMouseLeave={(e) => {
                      if (!locked && i !== selected)
                        (e.currentTarget as HTMLElement).style.background =
                          "rgba(20,28,60,0.9)";
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        width: 22,
                        height: 22,
                        lineHeight: "22px",
                        textAlign: "center",
                        background: "rgba(255,255,255,0.1)",
                        borderRadius: 6,
                        marginRight: 8,
                        fontSize: "0.8rem",
                        fontWeight: "bold",
                        color: "#9bcaff",
                      }}
                    >
                      {["A", "B", "C", "D"][i]}
                    </span>
                    {choice}
                  </button>
                );
              })}
            </div>

            {feedback && (
              <div
                style={{
                  marginTop: 14,
                  padding: "10px 16px",
                  borderRadius: 10,
                  background:
                    feedback.type === "correct"
                      ? "rgba(40,160,80,0.25)"
                      : "rgba(200,40,40,0.25)",
                  border:
                    feedback.type === "correct"
                      ? "1px solid #40c870"
                      : "1px solid #ff4040",
                  color: feedback.type === "correct" ? "#80ffaa" : "#ffaaaa",
                  fontSize: "0.95rem",
                  textAlign: "center",
                  fontFamily: "Georgia, serif",
                }}
              >
                {feedback.msg}
              </div>
            )}
          </div>

          <div style={{ paddingBottom: 12 }}>
            <button
              onClick={() => setPhase("select")}
              style={{
                background: "none",
                border: "none",
                color: "#6090cc",
                cursor: "pointer",
                fontSize: "0.9rem",
                fontFamily: "Georgia, serif",
              }}
            >
              ← Change Difficulty
            </button>
          </div>
        </>
      )}

      {/* ── WIN SCREEN ──────────────────────────────────────────────────── */}
      {phase === "win" && (
        <div style={{ ...cardStyle, textAlign: "center", maxWidth: 560 }}>
          <div style={{ fontSize: "3.5rem", marginBottom: 12 }}>🏆</div>
          <h2
            style={{
              color: "#ffd97a",
              fontSize: "2.2rem",
              textShadow: "0 0 20px rgba(255,210,80,0.8)",
              marginBottom: 10,
              fontFamily: "Georgia, serif",
            }}
          >
            Victory!
          </h2>
          <p style={{ color: "#dbe6ff", marginBottom: 6, fontSize: "1.05rem" }}>
            You defeated the {cfg.bossName}!
          </p>
          <div
            style={{
              display: "inline-block",
              padding: "3px 12px",
              borderRadius: 999,
              background:
                difficulty === "easy"
                  ? "rgba(64,200,112,0.15)"
                  : "rgba(255,68,68,0.15)",
              border: `1px solid ${cfg.color}`,
              color: cfg.color,
              fontSize: "0.8rem",
              letterSpacing: 2,
              textTransform: "uppercase",
              marginBottom: 14,
            }}
          >
            {cfg.emoji} {cfg.label} Mode
          </div>
          <p style={{ color: "#ffd97a", marginBottom: 20, fontSize: "1.3rem" }}>
            ⭐ Final Score: {score}
          </p>

          {/* Name entry / saved rank */}
          {!scoreSaved ? (
            <div
              style={{
                marginBottom: 20,
                padding: "16px 18px",
                borderRadius: 14,
                background: "rgba(255,210,80,0.07)",
                border: "1px solid rgba(255,210,80,0.25)",
              }}
            >
              <p
                style={{
                  color: "#ccd8ff",
                  fontSize: "0.9rem",
                  marginBottom: 10,
                  fontFamily: "Georgia, serif",
                }}
              >
                Enter your hero name to save to the leaderboard:
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="text"
                  value={heroName}
                  onChange={(e) =>
                    setHeroName(e.target.value.slice(0, 20))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && heroName.trim()) {
                      const name = heroName.trim() || "Hero";
                      const rank = getRank(score);
                      saveScore({
                        name,
                        score,
                        difficulty,
                        date: new Date().toISOString(),
                      });
                      setSavedRank(rank);
                      setScoreSaved(true);
                    }
                  }}
                  placeholder="Your hero name…"
                  maxLength={20}
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "1px solid rgba(149,194,255,0.4)",
                    background: "rgba(10,16,44,0.9)",
                    color: "white",
                    fontSize: "0.95rem",
                    fontFamily: "Georgia, serif",
                    outline: "none",
                  }}
                />
                <button
                  onClick={() => {
                    const name = heroName.trim() || "Hero";
                    const rank = getRank(score);
                    saveScore({
                      name,
                      score,
                      difficulty,
                      date: new Date().toISOString(),
                    });
                    setSavedRank(rank);
                    setScoreSaved(true);
                  }}
                  style={{
                    padding: "10px 18px",
                    borderRadius: 10,
                    border: "none",
                    background: "linear-gradient(135deg, #ffd97a, #ffaa40)",
                    color: "#071026",
                    fontWeight: "bold",
                    fontSize: "0.95rem",
                    cursor: "pointer",
                    fontFamily: "Georgia, serif",
                    whiteSpace: "nowrap",
                  }}
                >
                  Save ⭐
                </button>
              </div>
            </div>
          ) : (
            <div
              style={{
                marginBottom: 20,
                padding: "14px 18px",
                borderRadius: 14,
                background: "rgba(255,210,80,0.1)",
                border: "1px solid rgba(255,210,80,0.3)",
                fontFamily: "Georgia, serif",
              }}
            >
              <p style={{ color: "#ffd97a", fontSize: "1rem", marginBottom: 4 }}>
                ✅ Score saved, {heroName || "Hero"}!
              </p>
              {savedRank !== null && (
                <p style={{ color: "#9bcaff", fontSize: "0.9rem" }}>
                  {savedRank === 1
                    ? "🥇 You're #1 on the leaderboard!"
                    : savedRank === 2
                    ? "🥈 You're #2 on the leaderboard!"
                    : savedRank === 3
                    ? "🥉 You're #3 on the leaderboard!"
                    : `You ranked #${savedRank} on the leaderboard.`}
                </p>
              )}
              <Link
                href="/leaderboard"
                style={{
                  display: "inline-block",
                  marginTop: 10,
                  color: "#8ed2ff",
                  textDecoration: "none",
                  fontSize: "0.9rem",
                  borderBottom: "1px solid rgba(142,210,255,0.4)",
                }}
              >
                View full leaderboard →
              </Link>
            </div>
          )}

          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => startBattle(difficulty)}
              style={{
                padding: "14px 24px",
                borderRadius: 999,
                border: "none",
                background: "linear-gradient(135deg, #8ed2ff, #f5e4ff)",
                color: "#071026",
                fontWeight: "bold",
                fontSize: "1rem",
                cursor: "pointer",
                boxShadow: "0 0 24px rgba(119,189,255,0.7)",
                fontFamily: "Georgia, serif",
              }}
            >
              ⚔️ Battle Again
            </button>
            {difficulty === "easy" && (
              <button
                onClick={() => startBattle("hard")}
                style={{
                  padding: "14px 24px",
                  borderRadius: 999,
                  border: "none",
                  background: "linear-gradient(135deg, #ff4040, #ff8040)",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "1rem",
                  cursor: "pointer",
                  boxShadow: "0 0 24px rgba(255,68,68,0.5)",
                  fontFamily: "Georgia, serif",
                }}
              >
                💀 Try Hard Mode
              </button>
            )}
            <button
              onClick={() => setPhase("select")}
              style={{
                padding: "14px 24px",
                borderRadius: 999,
                border: "1px solid rgba(149,194,255,0.4)",
                background: "rgba(20,30,70,0.8)",
                color: "#9bcaff",
                fontWeight: "bold",
                fontSize: "1rem",
                cursor: "pointer",
                fontFamily: "Georgia, serif",
              }}
            >
              🎯 Change Difficulty
            </button>
          </div>
        </div>
      )}

      {/* ── LOSE SCREEN ─────────────────────────────────────────────────── */}
      {phase === "lose" && (
        <div style={{ ...cardStyle, textAlign: "center", maxWidth: 560 }}>
          <div style={{ fontSize: "3.5rem", marginBottom: 12 }}>💀</div>
          <h2
            style={{
              color: "#ff7070",
              fontSize: "2.2rem",
              textShadow: "0 0 20px rgba(255,80,80,0.8)",
              marginBottom: 12,
              fontFamily: "Georgia, serif",
            }}
          >
            Defeated!
          </h2>
          <p style={{ color: "#dbe6ff", marginBottom: 6, fontSize: "1.05rem" }}>
            The {cfg.bossName} was too powerful...
          </p>
          <p style={{ color: "#ffd97a", marginBottom: 24, fontSize: "1.2rem" }}>
            ⭐ Score: {score}
          </p>
          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => startBattle(difficulty)}
              style={{
                padding: "14px 24px",
                borderRadius: 999,
                border: "none",
                background: "linear-gradient(135deg, #ff7070, #ff4040)",
                color: "white",
                fontWeight: "bold",
                fontSize: "1rem",
                cursor: "pointer",
                boxShadow: "0 0 24px rgba(255,80,80,0.5)",
                fontFamily: "Georgia, serif",
              }}
            >
              🔄 Try Again
            </button>
            <button
              onClick={() => setPhase("select")}
              style={{
                padding: "14px 24px",
                borderRadius: 999,
                border: "1px solid rgba(149,194,255,0.4)",
                background: "rgba(20,30,70,0.8)",
                color: "#9bcaff",
                fontWeight: "bold",
                fontSize: "1rem",
                cursor: "pointer",
                fontFamily: "Georgia, serif",
              }}
            >
              🎯 Change Difficulty
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
