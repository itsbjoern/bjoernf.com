export const reduceData = (objs, options) => {
  // eslint-disable-next-line prettier/prettier
  const {
    key = null,
    reduce = (p, c) => {
      p.push(c);
      return p;
    },
    init = [],
    toAxes = false,
  } = options;

  if (objs.length === 0) {
    return [];
  }
  const dataPoint = objs[0];
  let keyFunction = key;
  if (typeof dataPoint === 'object') {
    if (!key) {
      throw Error('key is required when using objects');
    }
    if (typeof keyFunction !== 'function') {
      keyFunction = (x) => x[key];
    }
  }
  const binned = objs.reduce((p, c) => {
    const x = keyFunction(c);
    p[x] = p[x] || JSON.parse(JSON.stringify(init));
    p[x] = reduce(p[x], c);
    return p;
  }, {});
  if (toAxes) {
    return Object.entries(binned).map(([k, v]) => ({
      x: k,
      y: v,
    }));
  }

  return binned;
};
