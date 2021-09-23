// eslint-disable-next-line no-undef
const apiUrl = process.env.REACT_APP_API_URL

const buildRequest = (method, endpoint, data, headers) => {
  const requestData = {
    url: apiUrl + endpoint,
    method,
    headers: headers,
  }
  if (data) {
    requestData.body = data
  }
  return requestData
}

export const request = ({ url, ...rest }) => {
  return fetch(url, rest)
    .then((response) => {
      if (response.status !== 200) {
        return Promise.reject({ message: response.statusText })
      }
      return response
        .json()
        .then((data) => Promise.resolve(data))
        .catch((err) => Promise.reject(err))
    })
    .catch((err) => Promise.reject(err.message))
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
