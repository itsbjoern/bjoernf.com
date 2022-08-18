import { useState } from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  display: inline-flex;
  flex-direction: column;
  position: relative;
  min-width: 0;
  padding: 0;
  margin: 0;
  border: 0;
  vertical-align: top;

  ${({ focused }) =>
    !focused &&
    `
  &:hover fieldset {
    border-color: rgba(0, 0, 0, 0.53);
  }`}
`;

const Placeholder = styled.label`
  color: rgba(0, 0, 0, 0.6);
  font-size: 1rem;
  line-height: 1.4375em;
  letter-spacing: 0.00938em;
  padding: 0;
  display: block;
  transform-origin: top left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: calc(100% - 24px);
  position: absolute;
  left: 0;
  top: 0;
  transform: translate(14px, 16px) scale(1);
  -webkit-transition: color 200ms cubic-bezier(0, 0, 0.2, 1) 0ms,
    -webkit-transform 200ms cubic-bezier(0, 0, 0.2, 1) 0ms,
    max-width 200ms cubic-bezier(0, 0, 0.2, 1) 0ms;
  transition: color 200ms cubic-bezier(0, 0, 0.2, 1) 0ms,
    transform 200ms cubic-bezier(0, 0, 0.2, 1) 0ms,
    max-width 200ms cubic-bezier(0, 0, 0.2, 1) 0ms;
  z-index: 1;
  pointer-events: none;

  ${({ focused, hasContent, theme }) =>
    (focused || hasContent) &&
    `
    transform: translate(14px, -9px) scale(0.75);
    ${focused && `color: ${theme.palette.primary.main}`}
  `}
`;

const InputWrapper = styled.div`
  color: rgba(0, 0, 0, 0.87);
  box-sizing: border-box;
  position: relative;
  cursor: text;
  display: inline-flex;
  align-items: center;
  position: relative;
  border-radius: 4px;
  padding-right: 14px;

  & input {
    border: 0px;
    box-sizing: content-box;
    background: none;
    height: 1.4375em;
    margin: 0px;
    -webkit-tap-highlight-color: transparent;
    display: block;
    min-width: 0px;
    width: 100%;

    &:focus,
    &:focus-visible {
      outline: 0;
    }

    ${({ hasAdornement }) =>
      hasAdornement
        ? `padding: 16.5px 0px 16.5px 14px;`
        : `padding: 16.5px 14px;`}
  }
`;

const FieldsetWrapper = styled.fieldset`
  text-align: left;
  position: absolute;
  bottom: 0;
  right: 0;
  top: -5px;
  left: 0;
  margin: 0;
  padding: 0 8px;
  pointer-events: none;
  border-radius: inherit;
  border-style: solid;
  border-width: 1px;
  overflow: hidden;
  min-width: 0%;
  border-color: rgba(0, 0, 0, 0.23);

  ${({ focused, theme }) =>
    focused &&
    `
    color: ${theme.palette.primary.main};
    border-color: ${theme.palette.primary.main};
    border-width: 2px;
  `}

  & legend {
    float: unset;
    overflow: hidden;
    display: block;
    width: auto;
    padding: 0;
    height: 11px;
    font-size: 0.75em;
    visibility: hidden;
    max-width: 0.01px;
    transition: max-width 50ms cubic-bezier(0, 0, 0.2, 1) 50ms;
    white-space: nowrap;

    ${({ focused, hasContent }) =>
      (focused || hasContent) &&
      `
    max-width: 100%;
    transition: max-width 50ms cubic-bezier(0, 0, 0.2, 1) 100ms;
  `}

    & span {
      font-size: 15px;
      display: inline-block;
      opacity: 0;
      visibility: visible;
    }
  }
`;

const InputAdornment = styled.div`
  display: flex;
  height: 0.01em;
  max-height: 2em;
  -webkit-box-align: center;
  align-items: center;
  white-space: nowrap;
  color: rgba(0, 0, 0, 0.54);
  margin-right: 8px;
`;

const Fieldset = ({ label, ...props }) => {
  return (
    <FieldsetWrapper {...props}>
      <legend>
        <span>{label}</span>
      </legend>
    </FieldsetWrapper>
  );
};

const TextField = ({
  value,
  type = 'text',
  label,
  icon,
  onChange,
  onKeyDown,
  list,
  inputStyle,
  disabled,
}) => {
  const [focused, setFocused] = useState(false);
  const hasContent = !!value;
  return (
    <Wrapper
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      focused={focused}
    >
      {label ? (
        <Placeholder focused={focused} hasContent={hasContent}>
          {label}
        </Placeholder>
      ) : null}
      <InputWrapper
        focused={focused}
        hasContent={hasContent}
        hasAdornement={!!icon}
      >
        <input
          disabled={disabled}
          list={list}
          type={type}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          style={inputStyle}
        />
        {icon ? <InputAdornment>{icon}</InputAdornment> : null}
        <Fieldset focused={focused} hasContent={hasContent} label={label} />
      </InputWrapper>
    </Wrapper>
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
