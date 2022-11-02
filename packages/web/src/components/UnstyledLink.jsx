import React, { useRef } from 'react';
import { Link } from 'react-router-dom';

const ConsiderSSR = ({ to, delay, ...props }) => {
  const timeout = useRef();

  if (typeof to !== 'string') {
    return <div {...props} />;
  }

  return (
    <Link
      className="flex items-center"
      to={to}
      onClick={(e) => {
        if (timeout.current) {
          timeout.current = null;
          return;
        }
        if (!!delay) {
          const currTarget = e.currentTarget;
          e.preventDefault();
          timeout.current = setTimeout(() => {
            currTarget.click();
          }, delay);
        }
      }}
      {...props}
    />
  );
};

export default ConsiderSSR;
