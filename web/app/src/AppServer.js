import React from 'react'
import App from './App'
import './index.css'

import SSRProvider, { createSSRContext } from 'app/providers/SSRProvider'

const AppServer = (props) => {
  return (
    <SSRProvider>
      <App {...props} />
    </SSRProvider>
  )
}

export default AppServer
export { createSSRContext }
