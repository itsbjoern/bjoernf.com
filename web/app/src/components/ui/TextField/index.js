import { useState } from 'react';

import * as classes from './style.module.scss';

const TextField = ({
  value,
  type = 'text',
  label,
  icon,
  onChange,
  onClick,
  onKeyDown,
  list,
  inputStyle,
  disabled,
  className,
  inputProps = {},
}) => {
  const [focused, setFocused] = useState(false);
  return (
    <div
      className={`${classes.wrapper} ${focused ? 'focused' : ''}`}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      {label ? (
        <label
          className={`${classes.placeholder} ${
            !!value ? classes.placeholderFilled : ''
          }`}
        >
          {label}
        </label>
      ) : null}
      <div
        className={`${classes.inputWrapper} ${
          !!icon ? classes.withAdornment : ''
        }`}
      >
        <input
          className={className}
          disabled={disabled}
          list={list}
          type={type}
          value={value}
          onChange={onChange}
          onClick={onClick}
          onKeyDown={onKeyDown}
          style={inputStyle}
          {...inputProps}
        />
        {icon ? <div className={classes.adornment}>{icon}</div> : null}
        <fieldset
          className={`${classes.fieldset} ${
            !!value ? classes.fieldsetFilled : ''
          }`}
        >
          <legend>
            <span>{label}</span>
          </legend>
        </fieldset>
      </div>
    </div>
  );
};

export default TextField;

const Autocomplete = ({ options, ...rest }) => {
  const id = JSON.stringify(options);
  return (
    <div style={{ display: 'flex' }}>
      <TextField list={`datalist-${id}`} {...rest} />
      <datalist id={`datalist-${id}`}>
        {options.map((option) => {
          return <option key={option} value={option} />;
        })}
      </datalist>
    </div>
  );
};

export { Autocomplete };
