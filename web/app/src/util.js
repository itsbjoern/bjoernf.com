// eslint-disable-next-line no-undef
export const isDev = process.env.NODE_ENV === 'development';

// eslint-disable-next-line no-undef
export const isSSR = typeof window === 'undefined';

export const getFileUrl = (fileName, path = null) =>
  `https://s3.eu-west-2.amazonaws.com/bjornf.dev-public/${
    path ? path + '/' : ''
  }${fileName}`;

export const getPublicFileUrl = (fileName, path = '') =>
  getFileUrl(fileName, `public/${path}`);

export const getUploadFileUrl = (fileName, path = '') =>
  getFileUrl(fileName, `uploads/${path}`);
