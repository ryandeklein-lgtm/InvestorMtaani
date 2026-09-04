import { Link } from "react-router-dom";

function NotFound() {
  return (
    <>
      <FontImport />

      <div style={styles.page}>
        <div style={styles.pattern} />

        <div style={styles.inner}>
          <span style={styles.eyebrow}>Investor Mtaani</span>

          <h1 style={styles.code}>404</h1>

          <h2 style={styles.title}>Page Not Found</h2>

          <p style={styles.text}>
            The page you're looking for doesn't exist or may
            have moved.
          </p>

          <Link to="/" style={styles.button}>
            Back to Home
          </Link>
        </div>
      </div>
    </>
  );
}

function FontImport() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,500;0,700;1,500;1,600&family=Sora:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
    `}</style>
  );
}

// Brand palette (matches Landing page)
// Deep green:  #15402B
// Gold/amber:  #E7A93D
// Rust/red:    #C33F26
// Cream bg:    #FBF6EA
// Near-black:  #14110D

const styles = {
  page: {
    position: "relative",
    minHeight: "100vh",
    background: "#15402B",
    overflow: "hidden",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "'Sora', sans-serif",
    padding: "40px 20px",
  },

  pattern: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "repeating-linear-gradient(45deg, rgba(231,169,61,0.10) 0px, rgba(231,169,61,0.10) 2px, transparent 2px, transparent 16px), repeating-linear-gradient(-45deg, rgba(195,63,38,0.08) 0px, rgba(195,63,38,0.08) 2px, transparent 2px, transparent 16px)",
    pointerEvents: "none",
  },

  inner: {
    position: "relative",
    textAlign: "center",
    maxWidth: "480px",
  },

  eyebrow: {
    display: "block",
    fontFamily: "'Space Mono', monospace",
    fontSize: "13px",
    letterSpacing: "2px",
    textTransform: "uppercase",
    color: "#E7A93D",
    marginBottom: "18px",
  },

  code: {
    fontFamily: "'Fraunces', serif",
    fontWeight: "700",
    fontSize: "clamp(70px, 12vw, 110px)",
    color: "#FBF6EA",
    margin: "0",
    lineHeight: "1",
  },

  title: {
    fontFamily: "'Fraunces', serif",
    fontStyle: "italic",
    fontWeight: "500",
    fontSize: "26px",
    color: "#E7A93D",
    margin: "10px 0 18px",
  },

  text: {
    color: "#D9E5DC",
    lineHeight: "1.7",
    marginBottom: "32px",
  },

  button: {
    display: "inline-block",
    background: "#E7A93D",
    color: "#14110D",
    padding: "15px 32px",
    borderRadius: "8px",
    fontWeight: "700",
    fontFamily: "'Sora', sans-serif",
    textDecoration: "none",
  },
};

export default NotFound;
