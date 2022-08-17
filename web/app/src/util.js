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

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
export const formatDate = (tstamp) => {
  const date = new Date(tstamp * 1000);
  const day = date.getDay();
  const month = date.getMonth();
  const year = date.getFullYear();

  let dayAddon = 'th';
  if (day === 1) {
    dayAddon = 'st';
  } else if (day === 2) {
    dayAddon = 'nd';
  } else if (day === 3) {
    dayAddon = 'rd';
  }

  return `${months[month]} ${day}${dayAddon}, ${year}`;
};
