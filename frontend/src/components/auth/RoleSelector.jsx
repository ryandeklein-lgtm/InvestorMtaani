import "./RoleSelector.css";

const ROLES = [
  { value: "business", label: "Business" },
  { value: "investor", label: "Investor" },
];

function RoleSelector({ selectedRole, changeRole }) {
  return (
    <div className="role-selector">
      {ROLES.map((role) => (
        <button
          key={role.value}
          type="button"
          className={`role-option ${
            selectedRole === role.value ? "active" : ""
          }`}
          onClick={() => changeRole(role.value)}
        >
          {role.label}
        </button>
      ))}
    </div>
  );
}

export default RoleSelector;