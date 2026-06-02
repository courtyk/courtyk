import { Link } from "wouter";

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #050712, #111b3d 50%, #12061f)",
        textAlign: "center",
        padding: 20,
      }}
    >
      <div>
        <h1
          style={{
            fontSize: "clamp(2rem, 6vw, 4rem)",
            color: "white",
            textShadow: "0 0 25px rgba(105,93,255,0.75)",
            marginBottom: 16,
          }}
        >
          404 — Page Not Found
        </h1>
        <Link
          href="/"
          style={{
            display: "inline-block",
            padding: "14px 28px",
            borderRadius: 999,
            color: "#071026",
            background: "linear-gradient(135deg, #8ed2ff, #f5e4ff)",
            textDecoration: "none",
            fontWeight: "bold",
            boxShadow: "0 0 28px rgba(119,189,255,0.75)",
          }}
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
}
