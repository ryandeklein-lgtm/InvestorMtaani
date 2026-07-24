import { useNavigate } from "react-router-dom";

export default function Messages() {
  const navigate = useNavigate();

  const messages = [
    {
      id: 1,
      sender: "Green Harvest Ltd",
      text: "Thank you for your interest in our business.",
    },
    {
      id: 2,
      sender: "MotoPay Africa",
      text: "We have reviewed your matchmaking request.",
    },
    {
      id: 3,
      sender: "HealthLink",
      text: "Our founders are available for a meeting next week.",
    },
  ];

  return (
    <>
      <FontImport />

      <div style={styles.page}>
        <div style={styles.container}>
          <button
            onClick={() => navigate(-1)}
            style={styles.backButton}
          >
            ← Back
          </button>

          <span style={styles.eyebrow}>YOUR CONVERSATIONS</span>

          <h1 style={styles.title}>💬 Messages</h1>

          <p style={styles.subtitle}>
            Conversations between you and businesses.
          </p>

          {messages.map((message) => (
            <div key={message.id} style={styles.card}>
              <h3 style={styles.sender}>{message.sender}</h3>
              <p style={styles.text}>{message.text}</p>
            </div>
          ))}
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
// Tan bg:      #EFE2BE
// Near-black:  #14110D
// Body text:   #443F32 / #55503F

const styles = {
  page: {
    minHeight: "100vh",
    background: "#FBF6EA",
    padding: "40px 8% 80px",
    fontFamily: "'Sora', sans-serif",
    color: "#14110D",
  },

  container: {
    maxWidth: "820px",
    margin: "0 auto",
  },

  backButton: {
    background: "transparent",
    border: "none",
    color: "#C33F26",
    cursor: "pointer",
    marginBottom: "20px",
    fontSize: "15px",
    fontWeight: "700",
    fontFamily: "'Sora', sans-serif",
    padding: 0,
  },

  eyebrow: {
    display: "block",
    color: "#C33F26",
    fontSize: "12px",
    fontWeight: "800",
    letterSpacing: "1.5px",
    fontFamily: "'Space Mono', monospace",
    textTransform: "uppercase",
    marginBottom: "12px",
  },

  title: {
    fontFamily: "'Fraunces', serif",
    fontWeight: "700",
    fontSize: "36px",
    margin: "0 0 8px",
    color: "#14110D",
  },

  subtitle: {
    color: "#55503F",
    marginBottom: "30px",
    fontSize: "16px",
  },

  card: {
    background: "#FFFFFF",
    borderRadius: "14px",
    padding: "25px",
    marginBottom: "20px",
    border: "1px solid rgba(20,17,13,0.08)",
    boxShadow: "0 5px 15px rgba(20,17,13,.06)",
  },

  sender: {
    fontFamily: "'Fraunces', serif",
    fontWeight: "600",
    color: "#14110D",
    margin: "0 0 8px",
    fontSize: "18px",
  },

  text: {
    color: "#443F32",
    lineHeight: "1.7",
    margin: 0,
  },
};
