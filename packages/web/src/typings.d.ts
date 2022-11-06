declare module '*.module.scss' {
  const classes: { [key: string]: string };
  export default classes;
}

export declare global {
  export interface Window {
    __RESOLVED_DATA: Record<string, any>;
  }
}
