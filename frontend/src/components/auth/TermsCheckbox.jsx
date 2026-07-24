function TermsCheckbox({
  checked,
  onChange,
}) {
  return (
    <div className="checkbox">

      <input
        type="checkbox"
        name="agree"
        checked={checked}
        onChange={onChange}
      />

      <label>
        I agree to the Terms & Conditions
      </label>

    </div>
  );
}

export default TermsCheckbox;