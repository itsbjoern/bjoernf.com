import { FunctionalComponent } from 'preact';
import React from 'react';

import SSRProvider, {
  SSRProviderProps,
  createSSRContext,
} from 'src/providers/SSRProvider';

import App from './App';
import './index.css';

type AppServerProps = {
  ssr: SSRProviderProps['ssrProps'];
};

const AppServer: FunctionalComponent<AppServerProps> = (props) => {
  return (
    <SSRProvider ssrProps={props.ssr}>
      <App {...props} />
    </SSRProvider>
  );
};

export default AppServer;
export { createSSRContext };
