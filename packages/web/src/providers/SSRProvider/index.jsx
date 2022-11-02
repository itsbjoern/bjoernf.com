import { useState } from 'react';

import { SSRContext, toResolve, resolvedData } from './createContext';

const SSRProvider = ({ children, ssrProps }) => {
  const [props] = useState(ssrProps);
  if (!SSRContext) {
    new Error('Call "createSSRContext" before render');
  }

  const addResolve = (id, req) => {
    toResolve[id] = req;
  };
  const getResolvedData = (id) => resolvedData[id];

  return (
    <SSRContext.Provider value={{ addResolve, getResolvedData, props }}>
      {children}
    </SSRContext.Provider>
  );
};

export default SSRProvider;
