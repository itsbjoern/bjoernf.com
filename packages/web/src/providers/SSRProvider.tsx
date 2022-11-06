import React, {
  FunctionComponent,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import { FetchError, RequestInfo } from 'src/api';
import { paths } from 'src/api/schema';
import { Endpoints, ExtractResponse, Methods } from 'src/api/schemaUtils';
import { isSSR } from 'src/util';

import { useRequest } from './RequestProvider';

export type SSRProviderProps = {
  ssrProps?: {
    url: string;
    host: string;
  };
};

type SSRContextType = {
  addResolve: (id: string, req: Promise<any>) => void;
  getResolvedData: (id: string) => any;
  props: SSRProviderProps['ssrProps'];
};

export let SSRContext = React.createContext<SSRContextType | null>(null);
export let toResolve: {
  [key: string]: Promise<any>;
} = {};
export let resolvedData: {
  [key: string]: any;
} = {};

export const createSSRContext = () => {
  SSRContext = React.createContext<SSRContextType | null>(null);
  toResolve = {};
  resolvedData = {};

  const resolveData = () => {
    if (!toResolve) {
      return {};
    }
    const isDone = Object.keys(toResolve).map(() => false);

    return new Promise((resolve) => {
      if (isDone.length === 0) {
        resolve(resolvedData);
      }
      Object.entries(toResolve).forEach(([name, request], i) => {
        request
          .then((data) => {
            resolvedData[name] = data;
          })
          .catch((e) => {
            console.log(e);
          })
          .finally(() => {
            isDone[i] = true;
            if (isDone.every((e) => e)) {
              resolve(resolvedData);
            }
          });
      });
    });
  };

  return { resolveData };
};

const SSRProvider: FunctionComponent<SSRProviderProps> = ({
  children,
  ssrProps,
}) => {
  const [props] = useState(ssrProps);
  if (!SSRContext) {
    new Error('Call "createSSRContext" before render');
  }

  const addResolve = (id: string, req: Promise<any>) => {
    toResolve[id] = req;
  };
  const getResolvedData = (id: string) => resolvedData[id];

  return (
    <SSRContext.Provider value={{ addResolve, getResolvedData, props }}>
      {children}
    </SSRContext.Provider>
  );
};

export const useSSRProps = () => {
  const context = useContext(SSRContext);
  if (context === null) {
    return null;
  }
  return context.props;
};

export default SSRProvider;

type SSROptions<
  Endpoint extends Endpoints,
  Method extends Methods,
  T extends ExtractResponse<paths[Endpoint], Method>,
  X
> = {
  init?: X;
  deps?: any[];
  delay?: number;
  chainSuccess?: (data: T) => X;
  chainFirst?: () => void;
  chainFailure?: (err: FetchError) => void;
  chainFinally?: () => void;
  dataId?: string;
};

// eslint-disable-next-line no-unused-vars
const ssrDidChain: Record<string, boolean> = {};
const makePseudoId = <
  Endpoint extends Endpoints,
  Method extends Methods,
  T extends ExtractResponse<paths[Endpoint], Method>,
  X = T
>(
  options: SSROptions<Endpoint, Method, T, X>
) =>
  btoa(encodeURIComponent(JSON.stringify(options).replace(' ', ''))).slice(-12);
const windowData = () =>
  (globalThis.window && globalThis.window.__RESOLVED_DATA) || {};

export const useSSR = <
  Endpoint extends Endpoints,
  Method extends Methods,
  T extends ExtractResponse<paths[Endpoint], Method>,
  X = T
>(
  requestInfo: RequestInfo<Endpoint, Method>,
  options?: SSROptions<Endpoint, Method, T, X>
): { setData: React.StateUpdater<X | null> } & (
  | {
      data: null;
      loaded: false;
    }
  | {
      data: X;
      loaded: true;
    }
) => {
  const {
    deps = [],
    delay = null,
    chainFirst,
    chainSuccess = (data: T) => data,
    chainFailure,
    chainFinally,
    dataId = null,
  } = options ?? {};

  const fixedId = dataId ?? `data-${makePseudoId(options ?? {})}`;
  let initData = null;
  let hasSSRData = false;
  if (fixedId in windowData()) {
    initData = windowData()[fixedId];
    hasSSRData = true;
  }

  const [data, setData] = useState<X | null>(initData);
  const fetchNeeded = useRef(!hasSSRData);
  const timeout = useRef<NodeJS.Timeout>();

  const { sendRequest } = useRequest();
  const runFetch = useCallback(() => {
    chainFirst && chainFirst();
    fetchNeeded.current = false;
    sendRequest(requestInfo)
      .success((data) => setData(chainSuccess(data as T) as X))
      .failure(chainFailure)
      .finally(chainFinally);
  }, deps);

  useEffect(() => {
    if (!fetchNeeded.current) {
      fetchNeeded.current = true;
      return;
    }
    if (delay) {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
      timeout.current = setTimeout(() => {
        runFetch();
        timeout.current = undefined;
      }, delay);
    } else {
      runFetch();
    }
  }, [runFetch, delay]);

  const contextInternals = useContext(SSRContext);
  const { getResolvedData, addResolve } = contextInternals ?? {};

  // The SSR component return instantly, register requests with a counter for the current page and return
  if (isSSR) {
    if (getResolvedData && addResolve) {
      const resolvedData = getResolvedData(fixedId);
      if (resolvedData) {
        if (!ssrDidChain[fixedId]) {
          ssrDidChain[fixedId] = true;
          chainFinally && chainFinally();
        }
        return {
          data: resolvedData,
          setData,
          loaded: true,
        };
      }

      const ssrPrepRequest = sendRequest(requestInfo);
      addResolve(
        fixedId,
        new Promise((resolve) =>
          ssrPrepRequest.success((data) => resolve(chainSuccess(data as T)))
        )
      );
    }
  }

  if (fetchNeeded.current) {
    return {
      data: null,
      setData,
      loaded: false,
    };
  }

  return {
    data: data!,
    setData,
    loaded: true,
  };
};
