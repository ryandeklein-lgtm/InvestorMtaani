import FormInput from "./FormInput";
import FormSelect from "./FormSelect";
import PasswordInput from "./PasswordInput";

function DynamicForm({
  fields,
  formData,
  handleChange,
}) {
  return (
    <div className="dynamic-form-grid">
      {fields.map((field) => {
        return (
          <div
            key={field.name}
            className={`grid-col grid-${field.grid || 12}`}
          >
            {field.component === "input" && (
              <FormInput
                label={field.label}
                name={field.name}
                type={field.type}
                value={formData[field.name] || ""}
                placeholder={field.placeholder}
                onChange={handleChange}
                required={field.required}
              />
            )}

            {field.component === "password" && (
              <PasswordInput
                label={field.label}
                name={field.name}
                value={formData[field.name] || ""}
                placeholder={field.placeholder}
                onChange={handleChange}
                required={field.required}
              />
            )}

            {field.component === "select" && (
              <FormSelect
                label={field.label}
                name={field.name}
                value={formData[field.name] || ""}
                options={field.options}
                onChange={handleChange}
                required={field.required}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default DynamicForm;