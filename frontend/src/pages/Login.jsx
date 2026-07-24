import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import authService from "../services/auth";

function Login() {
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedRole) {
      setError("Please choose Business or Investor.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await authService.login(formData);

      // Prevent logging into the wrong portal
      if (response.user.role !== selectedRole) {
        setError(
          `This account is registered as a ${response.user.role}. Please use the correct login option.`
        );
        setLoading(false);
        return;
      }

      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));

      if (selectedRole === "business") {
        navigate("/business-profile");
      } else {
        navigate("/investor-profile");
      }

      window.location.reload();
    } catch (err) {
      setError(
        err.response?.data?.message || "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FontImport />

      <div style={styles.page}>
        <div style={styles.card}>
          <span style={styles.eyebrow}>Investor Mtaani</span>

          <h1 style={styles.title}>Welcome Back</h1>

          <p style={styles.subtitle}>
            Choose how you want to sign in
          </p>

          <div style={styles.roleButtons}>
            <button
              type="button"
              onClick={() => setSelectedRole("business")}
              style={{
                ...styles.roleButton,
                ...(selectedRole === "business"
                  ? styles.roleButtonBusinessActive
                  : {}),
              }}
            >
              🏢 Business
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole("investor")}
              style={{
                ...styles.roleButton,
                ...(selectedRole === "investor"
                  ? styles.roleButtonInvestorActive
                  : {}),
              }}
            >
              💼 Investor
            </button>
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <form onSubmit={handleSubmit}>
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
              style={styles.input}
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              style={styles.inputLast}
            />

            <button
              type="submit"
              disabled={loading}
              style={styles.submitButton}
            >
              {loading ? "Signing In..." : "Login"}
            </button>
          </form>

          <p style={styles.footerText}>
            Don't have an account?{" "}
            <Link to="/register" style={styles.link}>
              Register
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}

function FontImport() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,500;0,700;1,500;1,600&family=Sora:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');

      .im-login-input:focus {
        outline: none;
        border-color: #E7A93D !important;
        box-shadow: 0 0 0 4px rgba(231,169,61,.20);
      }
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
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "40px 20px",
    fontFamily: "'Sora', sans-serif",
  },

  card: {
    width: "100%",
    maxWidth: "440px",
    background: "#FFFFFF",
    border: "1px solid rgba(20,17,13,0.08)",
    padding: "40px",
    borderRadius: "16px",
    boxShadow: "0 10px 35px rgba(20,17,13,.08)",
  },

  eyebrow: {
    display: "block",
    textAlign: "center",
    fontFamily: "'Space Mono', monospace",
    fontSize: "12px",
    letterSpacing: "2px",
    textTransform: "uppercase",
    color: "#C33F26",
    marginBottom: "14px",
  },

  title: {
    textAlign: "center",
    color: "#14110D",
    fontFamily: "'Fraunces', serif",
    fontWeight: "600",
    fontSize: "32px",
    margin: "0 0 10px",
  },

  subtitle: {
    textAlign: "center",
    color: "#55503F",
    marginBottom: "30px",
  },

  roleButtons: {
    display: "flex",
    gap: "15px",
    marginBottom: "25px",
  },

  roleButton: {
    flex: 1,
    padding: "16px",
    borderRadius: "10px",
    border: "1px solid rgba(20,17,13,0.15)",
    background: "#FFFFFF",
    color: "#14110D",
    cursor: "pointer",
    fontWeight: "700",
    fontFamily: "'Sora', sans-serif",
    transition: "transform 0.15s ease",
  },

  roleButtonBusinessActive: {
    border: "2px solid #15402B",
    background: "#EFE2BE",
    color: "#15402B",
  },

  roleButtonInvestorActive: {
    border: "2px solid #C33F26",
    background: "#FBE3DB",
    color: "#C33F26",
  },

  error: {
    color: "#C33F26",
    textAlign: "center",
    marginBottom: "15px",
    fontSize: "14px",
  },

  input: {
    width: "100%",
    padding: "14px",
    marginBottom: "15px",
    borderRadius: "10px",
    border: "1px solid rgba(20,17,13,0.15)",
    fontFamily: "'Sora', sans-serif",
    fontSize: "15px",
  },

  inputLast: {
    width: "100%",
    padding: "14px",
    marginBottom: "20px",
    borderRadius: "10px",
    border: "1px solid rgba(20,17,13,0.15)",
    fontFamily: "'Sora', sans-serif",
    fontSize: "15px",
  },

  submitButton: {
    width: "100%",
    padding: "14px",
    background: "#E7A93D",
    color: "#14110D",
    border: "none",
    borderRadius: "8px",
    fontWeight: "700",
    fontFamily: "'Sora', sans-serif",
    cursor: "pointer",
  },

  footerText: {
    textAlign: "center",
    marginTop: "25px",
    color: "#55503F",
  },

  link: {
    color: "#C33F26",
    fontWeight: "700",
    textDecoration: "none",
  },
};

export default Login;
