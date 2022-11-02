import React, { useContext, forwardRef } from 'react';

export const RequestContext = React.createContext(null);

export const withRequest = (cls) => {
  const clsRenderer = cls.render || cls;
  const Wrapper = forwardRef((props, ref) => {
    const context = useContext(RequestContext);

    return clsRenderer({ ...props, ...context, ref });
  });
  Wrapper.displayName = clsRenderer.displayName;

  return Wrapper;
};

export const useRequest = () => {
  const context = useContext(RequestContext);
  return context;
};
