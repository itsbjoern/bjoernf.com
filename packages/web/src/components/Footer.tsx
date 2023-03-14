import React, { FunctionComponent } from 'react';

import Ref from 'src/components/Ref';

const Footer: FunctionComponent = () => {
  return (
    <div className="neo flex flex-col gap-4 rounded-t-lg bg-paper p-8">
      <div className="flex flex-row justify-between">
        <span>© Björn Friedrichs 2021</span>
        <Ref text={'privacy & more'} href="/about" />
      </div>
    </div>
  );
};

export default Footer;
