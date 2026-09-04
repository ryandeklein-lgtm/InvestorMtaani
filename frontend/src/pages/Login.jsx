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

      console.log("Login response:", response);

      if (!response || !response.user) {
        setError("Login failed. User information was not returned.");
        return;
      }

      if (response.user.role !== selectedRole) {
        setError(
          "This account is registered as " +
            response.user.role +
            ". Please choose the correct login option."
        );
        return;
      }

      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));

      if (response.user.role === "business") {
        navigate("/business-profile");
        return;
      }

      if (response.user.role === "investor") {
        navigate("/investor-profile");
        return;
      }

      navigate("/home");
    } catch (err) {
      console.error("Login error:", err);

      setError(
        err.response?.data?.message ||
          "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.brand}>
          INVESTOR MTAANI
        </div>

        <h1 style={styles.title}>
          Welcome Back
        </h1>

        <p style={styles.subtitle}>
          Choose how you want to sign in
        </p>

        <div style={styles.roleButtons}>
          <button
            type="button"
            onClick={() => {
              setSelectedRole("business");
              setError("");
            }}
            style={{
              ...styles.roleButton,
              ...(selectedRole === "business"
                ? styles.businessActive
                : {}),
            }}
          >
            <span style={styles.icon}>🏢</span>
            <span>Business</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedRole("investor");
              setError("");
            }}
            style={{
              ...styles.roleButton,
              ...(selectedRole === "investor"
                ? styles.investorActive
                : {}),
            }}
          >
            <span style={styles.icon}>💼</span>
            <span>Investor</span>
          </button>
        </div>

        {error && (
          <div style={styles.error}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label style={styles.label}>
            Email Address
          </label>

          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <label style={styles.label}>
            Password
          </label>

          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitButton,
              ...(loading ? styles.submitDisabled : {}),
            }}
          >
            {loading ? "Signing In..." : "Login"}
          </button>
        </form>

        <p style={styles.footerText}>
          Don't have an account?{" "}
          <Link
            to="/register"
            style={styles.link}
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#FBF6EA",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "40px 20px",
    fontFamily: "Arial, sans-serif",
  },

  card: {
    width: "100%",
    maxWidth: "460px",
    background: "#FFFFFF",
    padding: "40px",
    borderRadius: "18px",
    border: "1px solid rgba(20,17,13,0.08)",
    boxShadow: "0 12px 40px rgba(20,17,13,0.10)",
    boxSizing: "border-box",
  },

  brand: {
    textAlign: "center",
    color: "#C33F26",
    fontSize: "12px",
    fontWeight: "700",
    letterSpacing: "2px",
    marginBottom: "15px",
  },

  title: {
    textAlign: "center",
    color: "#14110D",
    fontSize: "32px",
    fontWeight: "700",
    margin: "0 0 10px",
  },

  subtitle: {
    textAlign: "center",
    color: "#55503F",
    fontSize: "15px",
    margin: "0 0 30px",
  },

  roleButtons: {
    display: "flex",
    gap: "10px",
    marginBottom: "25px",
  },

  roleButton: {
    flex: 1,
    minHeight: "80px",
    padding: "12px 6px",
    borderRadius: "10px",
    border: "1px solid rgba(20,17,13,0.15)",
    background: "#FFFFFF",
    color: "#14110D",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "13px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: "7px",
  },

  icon: {
    fontSize: "22px",
  },

  businessActive: {
    border: "2px solid #15402B",
    background: "#EFE2BE",
    color: "#15402B",
  },

  investorActive: {
    border: "2px solid #C33F26",
    background: "#FBE3DB",
    color: "#C33F26",
  },

  error: {
    background: "#FBE3DB",
    border: "1px solid #C33F26",
    color: "#C33F26",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "20px",
    fontSize: "14px",
    textAlign: "center",
  },

  label: {
    display: "block",
    color: "#443F32",
    fontSize: "13px",
    fontWeight: "700",
    marginBottom: "7px",
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "14px",
    marginBottom: "18px",
    borderRadius: "9px",
    border: "1px solid rgba(20,17,13,0.18)",
    fontSize: "15px",
    outline: "none",
  },

  submitButton: {
    width: "100%",
    padding: "15px",
    background: "#E7A93D",
    color: "#14110D",
    border: "none",
    borderRadius: "9px",
    fontWeight: "700",
    fontSize: "15px",
    cursor: "pointer",
    marginTop: "5px",
  },

  submitDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },

  footerText: {
    textAlign: "center",
    marginTop: "25px",
    marginBottom: "0",
    color: "#55503F",
    fontSize: "14px",
  },

  link: {
    color: "#C33F26",
    fontWeight: "700",
    textDecoration: "none",
  },
};

export default Login;