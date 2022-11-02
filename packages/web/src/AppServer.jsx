import React from 'react';

import SSRProvider from 'src/providers/SSRProvider';
import { createSSRContext } from 'src/providers/SSRProvider/createContext';

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
