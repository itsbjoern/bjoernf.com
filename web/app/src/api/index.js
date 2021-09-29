// eslint-disable-next-line no-undef
const apiUrl = process.env.REACT_APP_API_URL

const buildRequest = (method, endpoint, data, headers) => {
  const requestData = {
    url: apiUrl + '/api' + endpoint,
    method,
    headers: headers,
  }
  if (data) {
    requestData.body = data
  }

  return requestData
}

export const request = ({ url, headers, ...rest }, options) => {
  const { returnHeaders } = options || {}
  return fetch(url, {
    headers: new Headers(headers),
    mode: 'cors',
    ...rest,
  })
    .then((response) => {
      if (response.status !== 200) {
        return Promise.reject({
          message: response.statusText,
          status: response.status,
        })
      }
      return response
        .json()
        .then((data) => {
          if (returnHeaders) {
            return Promise.resolve({
              json: data,
              headers: Object.fromEntries(response.headers.entries()),
            })
          }
          return Promise.resolve(data)
        })
        .catch((err) => Promise.reject(err))
    })
    .catch((err) => Promise.reject(err))
}

export const get = (endpoint) => {
  return buildRequest('GET', endpoint, null)
}

export const post = (endpoint, data) => {
  return buildRequest('POST', endpoint, JSON.stringify(data))
}

export const postRaw = (endpoint, data) => {
  return buildRequest('POST', endpoint, data)
}
