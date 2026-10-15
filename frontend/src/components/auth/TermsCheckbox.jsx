import { Link } from "react-router-dom";

function TermsCheckbox({
  checked,
  onChange,
}) {
  return (
    <div className="checkbox">

      <input
        id="agree"
        type="checkbox"
        name="agree"
        required
        checked={checked}
        onChange={onChange}
      />

      <label htmlFor="agree">
        I agree to the{" "}
        <Link to="/terms" target="_blank" rel="noopener noreferrer">
          Terms & Conditions
        </Link>{" "}
        and{" "}
        <Link to="/privacy" target="_blank" rel="noopener noreferrer">
          Privacy Policy
        </Link>
      </label>

    </div>
  );
}

export default TermsCheckbox;
