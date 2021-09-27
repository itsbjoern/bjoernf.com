import React, { useState, useEffect, useContext, useRef } from 'react'
import { isSSR } from 'app/util'

export let SSRContext = null
let toResolve = null
let resolvedData = null

export const createSSRContext = () => {
  SSRContext = React.createContext(null)
  toResolve = {}
  resolvedData = {}

  const resolveData = () => {
    const isDone = Object.keys(toResolve).map(() => false)

    return new Promise((resolve) => {
      if (isDone.length === 0) {
        resolve(resolvedData)
      }
      Object.entries(toResolve).forEach(([name, request], i) => {
        request.then((data) => {
          resolvedData[name] = data
          isDone[i] = true

          if (isDone.every((e) => e)) {
            resolve(resolvedData)
          }
        })
      })
    })
  }

  return { resolveData }
}

const SSRProvider = ({ children }) => {
  if (!SSRContext) {
    new Error('Call "createSSRContext" before render')
  }
  const [counter, setCounter] = useState(0)

  const addResolve = (id, req) => {
    toResolve[id] = req
    setCounter(counter + 1)
  }
  const getResolvedData = (id) => resolvedData[id]

  return (
    <SSRContext.Provider value={{ addResolve, getResolvedData, counter }}>
      {children}
    </SSRContext.Provider>
  )
}

export const useSSR = (request, options) => {
  const ssrDidChain = useRef(false)
  const { getResolvedData, addResolve, counter } = SSRContext
    ? useContext(SSRContext)
    : {}
  const {
    init = null,
    deps = [],
    chainThen = (data) => data,
    chainCatch,
    chainFinally,
  } = options

  const [data, setData] = useState(init)

  useEffect(() => {
    request
      .then((data) => setData(chainThen(data)))
      .catch(chainCatch)
      .finally(chainFinally)
  }, deps)

  // The SSR component return instantly, register requests with a counter for the current page and return
  if (isSSR) {
    const pseudoId = `data-${counter}`
    const resolvedData = getResolvedData(pseudoId)
    if (resolvedData) {
      if (!ssrDidChain.current) {
        ssrDidChain.current = true
        chainFinally && chainFinally()
      }
      return [chainThen(resolvedData), setData]
    }

    addResolve(pseudoId, request)
  }

  return [data, setData]
}

export default SSRProvider
