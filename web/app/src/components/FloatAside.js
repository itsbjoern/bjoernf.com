import React from 'react';

const FloatAside = ({ children, menu, hideMenu, left = true }) => {
  return (
    <div className="flex h-auto flex-col">
      <div
        className={`md:sticky md:top-4 md:h-0 md:w-52 md:gap-12 ${
          left ? 'md:l-0 md:-translate-x-64' : 'md:translate-x-64 md:self-end'
        } smo:mb-2 ${hideMenu ? 'hidden' : ''}`}
      >
        {menu}
      </div>
      {children}
    </div>
  );
};

export default FloatAside;
