import React from 'react';

export let SSRContext = null;
export let toResolve = null;
export let resolvedData = null;

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
