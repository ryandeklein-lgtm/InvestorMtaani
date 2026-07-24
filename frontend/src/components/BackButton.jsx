import { useNavigate } from "react-router-dom";

function BackButton() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      style={styles.button}
    >
      ← Back
    </button>
  );
}

const styles = {
  button: {
    padding: "10px 18px",
    border: "none",
    borderRadius: "10px",
    background: "#ffffff",
    color: "#1e293b",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "15px",
    boxShadow: "0 5px 15px rgba(0,0,0,0.15)",
    marginBottom: "20px",
  },
};

export default BackButton;