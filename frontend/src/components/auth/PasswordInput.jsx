import { useState } from "react";

function PasswordInput({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="form-group">
      <label className="form-label" htmlFor={name}>
        {label}
        {required && <span className="required">*</span>}
      </label>

      <div className="password-wrapper">
        <input
          id={name}
          className="form-input password-input"
          type={showPassword ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete="new-password"
        />

        <button
          type="button"
          className="password-toggle"
          aria-label={showPassword ? "Hide password" : "Show password"}
          aria-pressed={showPassword}
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? "🙈" : "👁️"}
        </button>
      </div>
    </div>
  );
}

export default PasswordInput;
