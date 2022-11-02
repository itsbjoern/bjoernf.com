import React from 'react';

import SSRProvider from 'src/providers/SSRProvider';

import App from './App';

const AppClient = () => {
  return (
    <SSRProvider>
      <App />
    </SSRProvider>
  );
};

export default AppClient;
