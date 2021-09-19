import React, { useState, useCallback } from 'react'

import { request } from 'app/api'

export const RequestContext = React.createContext(null)

const UserProvider = ({ children }) => {
  const [token, _setToken] = useState(localStorage.getItem('authToken'))

  const setToken = (newToken) => {
    localStorage.setItem('authToken', newToken)
    _setToken(newToken)
  }

  const sendRequest = useCallback(
    ({ headers, ...payload }) => {
      const rewrittenHeaders = headers || {}
      if (!!token) {
        rewrittenHeaders['Authorization'] = `Bearer ${token}`
      }
      return request({ ...payload, headers: rewrittenHeaders })
    },
    [token]
  )

  return (
    <RequestContext.Provider value={{ sendRequest, token, setToken }}>
      {children}
    </RequestContext.Provider>
  )
}

export default UserProvider
