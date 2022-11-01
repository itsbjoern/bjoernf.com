const Switch = ({ checked, onChange, label, disabled }) => {
  return (
    <div style={{ display: 'inline-flex', flexDirection: 'row' }}>
      <input
        type="checkbox"
        id={`check-${label}`}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
      <label htmlFor={`check-${label}`}>{label}</label>
    </div>
  );
};

export default Switch;
