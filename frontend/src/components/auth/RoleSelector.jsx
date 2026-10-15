import "./RoleSelector.css";

const ROLES = [
  { value: "business", label: "Business" },
  { value: "investor", label: "Investor" },
];

function RoleSelector({ selectedRole, changeRole }) {
  return (
    <div
      className="role-selector"
      role="group"
      aria-label="Choose your account type"
    >
      {ROLES.map((role) => {
        const isActive = selectedRole === role.value;

        return (
          <button
            key={role.value}
            type="button"
            aria-pressed={isActive}
            className={`role-option ${isActive ? "active" : ""}`}
            onClick={() => changeRole(role.value)}
          >
            {role.label}
          </button>
        );
      })}
    </div>
  );
}

export default RoleSelector;