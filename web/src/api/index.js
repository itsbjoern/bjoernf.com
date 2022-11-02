// eslint-disable-next-line no-undef
export const apiUrl = import.meta.env.VITE_API_URL;

const buildRequest = (method, endpoint, data, headers) => {
  const requestData = {
    url: apiUrl + endpoint,
    method,
    headers: headers,
  };
  if (data) {
    requestData.body = data;
  }

  return requestData;
};

export class APIResponse extends Promise {
  success(func) {
    this.successFunc = func;
    return this.then((data) => {
      if (data && data.error) {
        if (this.failFunc) {
          return this.failFunc(data.error);
        }
        return APIResponse.resolve(data);
      }
      try {
        return func(data);
      } catch (e) {
        if (this.failFunc) {
          return this.failFunc(data.error);
        }
      }
      return APIResponse.resolve();
    });
  }

  failure(func) {
    this.failFunc = func;
    return this.then((data) => {
      if (data && data.error) {
        if (func) {
          return func(data.error);
        } else {
          return;
        }
      }
      if (data && this.successFunc) {
        return this.successFunc(data);
      }
      return APIResponse.resolve(data);
    });
  }
}

export const request = ({ url, headers, ...rest }, options) => {
  const { returnHeaders } = options || {};
  const promise = fetch(url, {
    headers: new Headers(headers),
    mode: 'cors',
    ...rest,
  })
    .then((response) => {
      if (response.status !== 200) {
        return Promise.reject({
          message: response.statusText,
          status: response.status,
        });
      }
      return response
        .json()
        .then((data) => {
          if (returnHeaders) {
            return Promise.resolve({
              json: data,
              headers: Object.fromEntries(response.headers.entries()),
            });
          }
          return Promise.resolve(data);
        })
        .catch((err) => Promise.reject(err));
    })
    .catch((err) => Promise.resolve({ error: err }));

  return new APIResponse((resolve) => {
    return promise
      .then((data) => resolve(data))
      .catch((e) => {
        console.log('In-App error\n', e);
      });
  });
};

export const get = (endpoint) => {
  return buildRequest('GET', endpoint, null);
};

export const post = (endpoint, data) => {
  return buildRequest('POST', endpoint, JSON.stringify(data));
};

export const deleteCall = (endpoint, data) => {
  return buildRequest('DELETE', endpoint, data, data && JSON.stringify(data));
};

export const postRaw = (endpoint, data) => {
  return buildRequest('POST', endpoint, data);
};
