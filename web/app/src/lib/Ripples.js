import React, { useState, useRef, useEffect, useCallback } from 'react';

const boxStyle = {
  position: 'relative',
  display: 'inline-flex',
  overflow: 'hidden',
};

const Ripples = ({
  during = 600,
  color = 'rgba(0, 0, 0, .08)',
  children,
  disabled,
  flex,
  className,
  ...rest
}) => {
  const [rippleStyle, setRippleStyle] = useState({
    position: 'absolute',
    borderRadius: '50%',
    opacity: 0,
    width: 35,
    height: 35,
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
  });

  const timer = useRef(0);

  useEffect(() => {
    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, []);

  const onMouseDown = useCallback(
    (ev) => {
      ev.stopPropagation();

      const { pageX, pageY, currentTarget } = ev;

      const rect = currentTarget.getBoundingClientRect();

      const left = pageX - (rect.left + window.scrollX);
      const top = pageY - (rect.top + window.scrollY);
      const size = Math.max(rect.width, rect.height);

      setRippleStyle((state) => {
        timer.current = setTimeout(() => {
          setRippleStyle((state) => ({
            ...state,
            transform: `scale(${size / 9})`,
            transition: `all ${during}ms`,
          }));
        }, 50);
        return {
          ...state,
          left,
          top,
          opacity: 1,
          transform: 'translate(-50%, -50%)',
          transition: 'initial',
          backgroundColor: color,
        };
      });
    },
    [during, color]
  );

  const onMouseUp = () => {
    setRippleStyle((state) => ({
      ...state,
      opacity: 0,
      transition: `all 450ms`,
    }));
  };

  if (disabled) {
    return (
      <div
        {...rest}
        className={`react-ripples`}
        style={{ ...boxStyle, flex: flex ? 1 : null }}
      >
        {children}
        <s style={rippleStyle} />
      </div>
    );
  }

  return (
    <div
      {...rest}
      className={`react-ripples ${className}`}
      style={{ ...boxStyle, flex: flex ? 1 : null }}
      onPointerDown={onMouseDown}
      onPointerUp={onMouseUp}
      onPointerOut={onMouseUp}
    >
      {children}
      <s style={rippleStyle} />
    </div>
  );
};

export default Ripples;
