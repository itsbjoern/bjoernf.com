import React from 'react';

const FloatAside = ({ children, menu, hideMenu, left = true }) => {
  return (
    <div className="flex h-auto flex-col">
      <div
        className={`sm:sticky sm:top-4 sm:h-0 sm:w-52 sm:gap-12 ${
          left ? 'sm:l-0 sm:-translate-x-64' : 'sm:translate-x-64 sm:self-end'
        } smo:mb-2 ${hideMenu ? 'hidden' : ''}`}
      >
        {menu}
      </div>
      {children}
    </div>
  );
};

export default FloatAside;
