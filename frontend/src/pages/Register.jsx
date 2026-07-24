import { Link } from "react-router-dom";

import "./Register.css";

import AuthLayout from "../components/auth/AuthLayout";
import DynamicForm from "../components/auth/DynamicForm";
import RoleSelector from "../components/auth/RoleSelector";
import TermsCheckbox from "../components/auth/TermsCheckbox";

import useRegisterForm from "../hooks/useRegisterForm";

import {
  businessFields,
  investorFields,
} from "../data/registerFields";

function Register() {
  const {
    selectedRole,
    formData,
    loading,
    message,
    error,
    handleChange,
    changeRole,
    handleSubmit,
  } = useRegisterForm();

  const fields =
    selectedRole === "business"
      ? businessFields
      : investorFields;
        return (
    <AuthLayout>

      <h1 className="register-title">
        Create Your Account
      </h1>

      <p className="register-subtitle">
        Join Investor Mtaani and connect with opportunities across Africa.
      </p>

      <RoleSelector
        selectedRole={selectedRole}
        changeRole={changeRole}
      />

      {message && (
        <div className="success-message">
          {message}
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>

        <DynamicForm
          fields={fields}
          formData={formData}
          handleChange={handleChange}
        />

        <TermsCheckbox
          checked={formData.agree}
          onChange={handleChange}
        />

        <button
          type="submit"
          className="register-button"
          disabled={loading}
        >
          {loading
            ? "Creating Account..."
            : "Create Account"}
        </button>

      </form>

      <div className="login-link">
        Already have an account?{" "}
        <Link to="/login">
          Login
        </Link>
      </div>

    </AuthLayout>
  );
}
export default Register;
