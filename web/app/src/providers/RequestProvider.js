import React, { useState, useCallback, useContext, forwardRef } from 'react'

import { request } from 'app/api'
import { isSSR } from 'app/util'

export const RequestContext = React.createContext(null)

const UserProvider = ({ children }) => {
  const [token, _setToken] = useState(
    isSSR ? '' : localStorage.getItem('authToken')
  )

  const setToken = (newToken) => {
    if (!isSSR) {
      if (newToken) {
        localStorage.setItem('authToken', newToken)
      } else {
        localStorage.removeItem('authToken')
      }
    }

    _setToken(newToken)
  }

  const sendRequest = useCallback(
    ({ headers, ...payload }, options) => {
      const rewrittenHeaders = headers || {}
      if (!!token) {
        rewrittenHeaders['Authorization'] = `Bearer ${token}`
      }
      return request({ ...payload, headers: rewrittenHeaders }, options).catch(
        (e) => {
          if (e.status == 401) {
            setToken(null)
          }
          return Promise.reject(e)
        }
      )
    },
    [token]
  )

  return (
    <RequestContext.Provider value={{ sendRequest, token, setToken }}>
      {children}
    </RequestContext.Provider>
  )
}

export const withRequest = (cls) => {
  cls = cls.render || cls
  const Wrapper = forwardRef((props, ref) => {
    const context = useContext(RequestContext)

    return cls({ ...props, ...context, ref })
  })
  Wrapper.displayName = cls.displayName

  return Wrapper
}

export default UserProvider
