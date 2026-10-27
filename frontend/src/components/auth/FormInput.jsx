function FormInput({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
}) {
  return (
    <div className="form-group">
      <label className="form-label" htmlFor={name}>
        {label}
        {required && <span className="required">*</span>}
      </label>

      <input
        id={name}
        className="form-input"
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        autoComplete={name === "email" ? "email" : name === "phone" ? "tel" : name === "name" ? "name" : name === "businessName" || name === "company" ? "organization" : undefined}
      />
    </div>
  );
}

export default FormInput;
