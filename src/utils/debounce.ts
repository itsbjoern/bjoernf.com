export const debounce = <P, X>(
  func: (...args: Array<P>) => X,
  wait: number,
) => {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Array<P>) => {
    clearTimeout(timeout);
    timeout = setTimeout(async () => await func(...args), wait);
  };
};
