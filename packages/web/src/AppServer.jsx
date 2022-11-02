import React from 'react';

import SSRProvider, { createSSRContext } from 'src/providers/SSRProvider';

import App from './App';
import './index.css';

const AppServer = (props) => {
  return (
    <SSRProvider ssrProps={props.ssr}>
      <App {...props} />
    </SSRProvider>
  );
};

export default AppServer;
export { createSSRContext };
