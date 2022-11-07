import { FunctionalComponent, VNode } from 'preact';
import { ChangeEvent, CSSProperties, HTMLAttributes } from 'preact/compat';
import { useState } from 'react';

import classes from './style.module.scss';
type TextFieldProps = {
  value?: string;
  label?: string;
  type?: 'text' | 'password';
  icon?: VNode;
  onChange?: (evt: ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (evt: KeyboardEvent) => void;
  onClick?: (evt: MouseEvent) => void;
  list?: string;
  inputStyle?: CSSProperties;
  disabled?: boolean;
  className?: string;
  inputProps?: HTMLAttributes<HTMLInputElement>;
};

const TextField: FunctionalComponent<TextFieldProps> = ({
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
    <div className={`${classes.wrapper} ${focused ? 'focused' : ''}`}>
      {label ? (
        <label
          className={`${classes.placeholder} ${
            value ? classes.placeholderFilled : ''
          } ${focused && value ? '!text-primary' : ''}`}
        >
          {label}
        </label>
      ) : null}
      <div
        className={`${classes.inputWrapper} ${
          icon ? classes.withAdornment : ''
        }`}
      >
        <input
          className={className}
          disabled={disabled}
          list={list}
          type={type}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
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
            value ? classes.fieldsetFilled : ''
          } ${focused ? '!border-primary' : ''}`}
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

type AutocompleteProps = TextFieldProps & {
  options: string[];
};

const Autocomplete: FunctionalComponent<AutocompleteProps> = ({
  options,
  ...rest
}) => {
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
