import React, { FunctionComponent, useRef } from 'react';
import { Link } from 'react-router-dom';

type UnstyledLinkProps = {
  to?: string;
  delay?: number;
};

const UnstyledLink: FunctionComponent<UnstyledLinkProps> = ({
  to,
  delay,
  ...props
}) => {
  const timeout = useRef<NodeJS.Timeout>();

  if (typeof to !== 'string') {
    return <div {...props} />;
  }

  return (
    <Link
      className="flex items-center"
      to={to}
      onClick={(e: MouseEvent) => {
        if (timeout.current) {
          timeout.current = undefined;
          return;
        }
        if (delay) {
          const currTarget = e.currentTarget as HTMLLinkElement;
          if (currTarget) {
            e.preventDefault();
            timeout.current = setTimeout(() => {
              currTarget.click();
            }, delay);
          }
        }
      }}
      {...props}
    />
  );
};

export default UnstyledLink;
