import { Link } from "wouter";

const bgVideo = "/hero-video.mp4";

export default function LandingPage() {
  return (
    <main
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: "#050712",
      }}
    >
      {/* Full-screen video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 0,
        }}
      >
        <source src={bgVideo} type="video/mp4" />
      </video>

      {/* Bottom gradient so text is readable */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to top, rgba(5,7,18,0.95) 0%, rgba(5,7,18,0.4) 40%, transparent 70%)",
          zIndex: 1,
        }}
      />

      {/* Content pinned to bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 2,
          padding: "0 24px 52px",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div
          style={{
            color: "#92c8ff",
            letterSpacing: 4,
            textTransform: "uppercase",
            fontSize: "0.8rem",
          }}
        >
          AI Fantasy Learning Game
        </div>

        <h1
          style={{
            fontSize: "clamp(3rem, 10vw, 6.5rem)",
            lineHeight: 0.95,
            color: "white",
            textShadow:
              "0 0 40px rgba(104,170,255,0.8), 0 2px 20px rgba(0,0,0,0.9)",
            fontFamily: "Georgia, serif",
            margin: 0,
          }}
        >
          Quest Arena
        </h1>

        <p
          style={{
            color: "rgba(220,235,255,0.85)",
            fontSize: "clamp(0.9rem, 2vw, 1.1rem)",
            lineHeight: 1.6,
            maxWidth: 520,
            margin: "4px 0 12px",
            textShadow: "0 1px 8px rgba(0,0,0,0.8)",
          }}
        >
          Battle giant monsters in a magical RPG world where every attack
          depends on answering a question correctly.
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <Link
            href="/battle"
            style={{
              display: "inline-block",
              padding: "15px 34px",
              borderRadius: 999,
              color: "#081126",
              background: "linear-gradient(135deg, #8ed2ff, #f2e6ff)",
              textDecoration: "none",
              fontWeight: "bold",
              fontSize: "1.05rem",
              boxShadow:
                "0 0 28px rgba(119,189,255,0.7), 0 4px 20px rgba(0,0,0,0.5)",
              transition: "transform 0.22s ease, box-shadow 0.22s ease",
              fontFamily: "Georgia, serif",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform =
                "translateY(-3px) scale(1.03)";
              (e.currentTarget as HTMLElement).style.boxShadow =
                "0 0 40px rgba(171,219,255,1), 0 6px 24px rgba(0,0,0,0.6)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "";
              (e.currentTarget as HTMLElement).style.boxShadow =
                "0 0 28px rgba(119,189,255,0.7), 0 4px 20px rgba(0,0,0,0.5)";
            }}
          >
            ⚔️ Enter the Boss Battle
          </Link>

          <Link
            href="/leaderboard"
            style={{
              display: "inline-block",
              padding: "15px 26px",
              borderRadius: 999,
              border: "1px solid rgba(154,205,255,0.5)",
              background: "rgba(6,10,31,0.55)",
              color: "#9bcaff",
              textDecoration: "none",
              fontWeight: "bold",
              fontSize: "1rem",
              backdropFilter: "blur(8px)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
              transition: "transform 0.22s ease, background 0.22s ease",
              fontFamily: "Georgia, serif",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform =
                "translateY(-3px)";
              (e.currentTarget as HTMLElement).style.background =
                "rgba(20,36,80,0.75)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "";
              (e.currentTarget as HTMLElement).style.background =
                "rgba(6,10,31,0.55)";
            }}
          >
            🏆 Leaderboard
          </Link>
        </div>
      </div>
    </main>
  );
}
