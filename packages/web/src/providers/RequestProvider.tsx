import React, { useState, useEffect, useContext, FunctionComponent } from 'react';

import { APIResponse, request, RequestInfo, RequestOptions } from 'src/api';
import { paths } from 'src/api/schema';
import { Endpoints, ExtractResponse, Methods } from 'src/api/schemaUtils';
import { isSSR } from 'src/util';

export type RequestSender = <
  Endpoint extends Endpoints,
  Method extends Methods,
  T extends ExtractResponse<paths[Endpoint], Method>
>(
  { headers, ...payload }: RequestInfo<Endpoint, Method>,
  options?: RequestOptions
) => APIResponse<T>;

export type RequestContextType = {
  sendRequest: RequestSender;
  token: string;
  setToken: (token: string) => void;
};

export const RequestContext = React.createContext<RequestContextType | null>(
  null
);

export const useRequest = () => {
  const context = useContext(RequestContext);
  return context!;
};

const UserProvider: FunctionComponent = ({ children }) => {
  const [token, _setToken] = useState('');
  useEffect(() => {
    setToken(localStorage.getItem('authToken') ?? '');
  });

  const setToken = (newToken: string) => {
    if (!isSSR) {
      if (newToken) {
        localStorage.setItem('authToken', newToken);
      } else {
        localStorage.removeItem('authToken');
      }
    }

    _setToken(newToken);
  };

  const sendRequest = <Endpoint extends Endpoints, Method extends Methods>(
    { headers, ...payload }: RequestInfo<Endpoint, Method>,
    options?: RequestOptions
  ) => {
    const rewrittenHeaders = headers || {};
    const currentToken =
      token ||
      (globalThis.localStorage && globalThis.localStorage.getItem('authToken'));
    if (currentToken) {
      rewrittenHeaders['Authorization'] = `Bearer ${currentToken}`;
    }
    if (isSSR) {
      rewrittenHeaders['user-agent'] = 'Node;https://bjornf.dev';
    }
    return request({ ...payload, headers: rewrittenHeaders }, options).failure(
      (e) => {
        if (e.status == 401) {
          setToken('');
        }
      }
    ) as APIResponse<ExtractResponse<Endpoint, Method>>;
  };

  return (
    <RequestContext.Provider value={{ sendRequest, token, setToken }}>
      {children}
    </RequestContext.Provider>
  );
};

export default UserProvider;
