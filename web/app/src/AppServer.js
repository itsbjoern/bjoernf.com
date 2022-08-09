import React from 'react';

import SSRProvider, { createSSRContext } from 'app/providers/SSRProvider';

import App from './App';
import './index.css';

const AppServer = (props) => {
  return (
    <SSRProvider>
      <App {...props} />
    </SSRProvider>
  );
};

export default AppServer;
export { createSSRContext };
