import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
} from 'react';

import { isSSR } from 'app/util';

export let SSRContext = null;
let toResolve = null;
let resolvedData = null;

export const createSSRContext = () => {
  SSRContext = React.createContext(null);
  toResolve = {};
  resolvedData = {};

  const resolveData = () => {
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
createSSRContext();

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

// eslint-disable-next-line no-unused-vars
const ssrDidChain = {};
const makePseudoId = (options) =>
  btoa(encodeURIComponent(JSON.stringify(options).replace(' ', '')));
const windowData = () => (global.window && global.window.__RESOLVED_DATA) || {};

export const useSSRProps = () => {
  const context = useContext(SSRContext);
  if (context === null) {
    return null;
  }
  return context.props;
};

export const useSSR = (request, options) => {
  const timeout = useRef();

  const { getResolvedData, addResolve } = isSSR ? useContext(SSRContext) : {};
  const {
    init = null,
    deps = [],
    delay = null,
    chainFirst,
    chainSuccess = (data) => data,
    chainFailure,
    chainFinally,
    dataId = null,
  } = options;

  const fixedId = dataId ?? `data-${makePseudoId(options)}`;
  let initData = init;
  let hasSSRData = false;
  if (fixedId in windowData()) {
    initData = windowData()[fixedId];
    hasSSRData = true;
  }

  const [data, setData] = useState(initData);
  const fetchNeeded = useRef(!hasSSRData);

  const runFetch = useCallback(() => {
    chainFirst && chainFirst();
    request()
      .success((data) => setData(chainSuccess(data)))
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
        timeout.current = null;
      }, delay);
    } else {
      runFetch();
    }
  }, [runFetch, delay]);

  // The SSR component return instantly, register requests with a counter for the current page and return
  if (isSSR) {
    const resolvedData = getResolvedData(fixedId);
    if (resolvedData) {
      if (!ssrDidChain[fixedId]) {
        ssrDidChain[fixedId] = true;
        chainFinally && chainFinally();
      }
      return [resolvedData, setData];
    }

    const ssrPrepRequest = request()
      .success((data) => chainSuccess(data))
      .failure((e) => e);
    addResolve(fixedId, ssrPrepRequest);
  }

  return [data, setData];
};

export default SSRProvider;
