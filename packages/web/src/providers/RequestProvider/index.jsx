import React, { useState, useEffect, useCallback } from 'react';

import { request } from 'src/api';
import { isSSR } from 'src/util';

import { RequestContext } from './hooks';

const UserProvider = ({ children }) => {
  const [token, _setToken] = useState('');
  useEffect(() => {
    setToken(localStorage.getItem('authToken'));
  });

  const setToken = (newToken) => {
    if (!isSSR) {
      if (newToken) {
        localStorage.setItem('authToken', newToken);
      } else {
        localStorage.removeItem('authToken');
      }
    }

    _setToken(newToken);
  };

  const sendRequest = useCallback(
    ({ headers, ...payload }, options) => {
      const rewrittenHeaders = headers || {};
      const currentToken =
        token ||
        (globalThis.localStorage &&
          globalThis.localStorage.getItem('authToken'));
      if (!!currentToken) {
        rewrittenHeaders['Authorization'] = `Bearer ${currentToken}`;
      }
      if (isSSR) {
        rewrittenHeaders['user-agent'] = 'Node;https://bjornf.dev';
      }
      return request(
        { ...payload, headers: rewrittenHeaders },
        options
      ).failure((e) => {
        if (e.status == 401) {
          setToken(null);
        }
        return { error: e };
      });
    },
    [token]
  );

  return (
    <RequestContext.Provider value={{ sendRequest, token, setToken }}>
      {children}
    </RequestContext.Provider>
  );
};

export default UserProvider;
