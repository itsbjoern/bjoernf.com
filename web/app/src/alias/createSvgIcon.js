import React from 'react';
import styled from 'styled-components';

const capitalize = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const SvgIconRoot = styled('svg', {
  name: 'SvgIcon',
  slot: 'Root',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;

    return [
      styles.root,
      ownerState.color !== 'inherit' &&
        styles[`color${capitalize(ownerState.color)}`],
      styles[`fontSize${capitalize(ownerState.fontSize)}`],
    ];
  },
})(({ theme, ownerState }) => ({
  userSelect: 'none',
  width: '1em',
  height: '1em',
  display: 'inline-block',
  fill: 'currentColor',
  flexShrink: 0,
  transition: theme.transitions?.create?.('fill', {
    duration: theme.transitions?.duration?.shorter,
  }),
  fontSize: {
    inherit: 'inherit',
    small: theme.typography?.pxToRem?.(20) || '1.25rem',
    medium: theme.typography?.pxToRem?.(24) || '1.5rem',
    large: theme.typography?.pxToRem?.(35) || '2.1875',
  }[ownerState.fontSize],
  // TODO v5 deprecate, v6 remove for sx
  color:
    (theme.vars || theme).palette?.[ownerState.color]?.main ??
    {
      action: (theme.vars || theme).palette?.action?.active,
      disabled: (theme.vars || theme).palette?.action?.disabled,
      inherit: undefined,
    }[ownerState.color],
}));

const SvgIcon = React.forwardRef(function SvgIcon(inProps, ref) {
  const {
    children,
    color = 'inherit',
    component = 'svg',
    fontSize = 'medium',
    htmlColor,
    inheritViewBox = false,
    titleAccess,
    viewBox = '0 0 24 24',
    ...other
  } = inProps;

  const ownerState = {
    ...inProps,
    color,
    component,
    fontSize,
    instanceFontSize: inProps.fontSize,
    inheritViewBox,
    viewBox,
  };

  const more = {};

  if (!inheritViewBox) {
    more.viewBox = viewBox;
  }

  return (
    <SvgIconRoot
      as={component}
      ownerState={ownerState}
      focusable="false"
      color={htmlColor}
      aria-hidden={titleAccess ? undefined : true}
      role={titleAccess ? 'img' : undefined}
      ref={ref}
      {...more}
      {...other}
    >
      {children}
      {titleAccess ? <title>{titleAccess}</title> : null}
    </SvgIconRoot>
  );
});

const createSvgIcon = (path, displayName) => {
  const Component = React.memo(
    React.forwardRef((props, ref) => (
      <SvgIcon ref={ref} {...props}>
        {path}
      </SvgIcon>
    ))
  );

  if (process.env.NODE_ENV !== 'production') {
    Component.displayName = `${displayName}Icon`;
  }

  return Component;
};

export default createSvgIcon;
