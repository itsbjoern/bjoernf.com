import { useId } from 'react';

const Switch = ({ checked, onChange, label, disabled }) => {
  const id = useId();
  return (
    <div style={{ display: 'inline-flex', flexDirection: 'row' }}>
      <input
        type="checkbox"
        id={`check-${id}`}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
      <label htmlFor={`check-${id}`}>{label}</label>
    </div>
  );
};

export default Switch;
