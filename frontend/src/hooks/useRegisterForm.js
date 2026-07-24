import { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/auth";

export default function useRegisterForm() {
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState("business");

  const [formData, setFormData] = useState({
    name: "",
    businessName: "",
    company: "",
    phone: "",
    email: "",
    country: "Kenya",
    county: "",
    industry: "",
    stage: "",
    investorType: "",
    investmentRange: "",
    password: "",
    confirmPassword: "",
    role: "business",
    agree: false,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const changeRole = (role) => {
    setSelectedRole(role);

    setFormData((prev) => ({
      ...prev,
      role,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!formData.agree) {
      setError("Please accept the Terms & Conditions.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        profile: {
          businessName: formData.businessName,
          industry: formData.industry,
          county: formData.county,
          stage: formData.stage,
          company: formData.company,
          phone: formData.phone,
          country: formData.country,
          investorType: formData.investorType,
          investmentRange: formData.investmentRange,
        },
      };

      const response = await authService.register(payload);

      setMessage(response.message || "Registration successful!");

      setTimeout(() => navigate("/"), 1200);

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Registration failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    selectedRole,
    formData,
    loading,
    message,
    error,
    handleChange,
    changeRole,
    handleSubmit,
  };
}