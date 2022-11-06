/// <reference types="vite-plugin-svgr/client" />

import { FunctionalComponent } from 'preact';
import React from 'react';
import { Link } from 'react-router-dom';

import { ReactComponent as TransitEnterexitIcon } from 'src/components/icons/TransitEnterexit.svg';

type LinkRenderProps = {
  external: boolean;
  href: string;
};

const LinkRender: FunctionalComponent<LinkRenderProps> = ({
  external,
  href,
  ...props
}) =>
  external ? (
    <a
      className="inline text-primary underline decoration-primary hover:decoration-orange-200"
      href={href}
      rel="noreferrer"
      target="_blank"
      {...props}
    />
  ) : (
    <Link
      className="text-primary underline decoration-primary hover:decoration-orange-200"
      to={href}
      {...props}
    />
  );

type RefProps = {
  text?: string;
  href: string;
};

const Ref: FunctionalComponent<RefProps> = ({ text, href }) => {
  const isExternal = href.slice(0, 1) !== '/';
  return (
    <React.Fragment>
      {' '}
      <LinkRender external={isExternal} href={href}>
        {text || href}
        {isExternal ? (
          <TransitEnterexitIcon
            style={{
              display: 'inline',
              marginLeft: 0,
              fontSize: '1rem',
              transform: 'rotate(180deg)',
            }}
          />
        ) : null}
      </LinkRender>
    </React.Fragment>
  );
};

export default Ref;
