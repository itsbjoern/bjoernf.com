import React, { useEffect } from 'react'
import { withRouter } from 'react-router-dom'

import { withRequest } from 'app/providers/RequestProvider'

import { isSSR } from 'app/util'

// const getTimezone = () => {
//   try {
//     return Intl.DateTimeFormat().resolvedOptions().timeZone
//   } catch (e) {
//     return null
//   }
// }

// const getOS = () => {
//   const userAgent = global.window?.navigator?.userAgent
//   const platform = global.window?.navigator?.platform
//   const macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K', 'darwin']
//   const windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE']
//   const iosPlatforms = ['iPhone', 'iPad', 'iPod']

//   if (macosPlatforms.indexOf(platform) !== -1) {
//     return ['Mac', 'desktop']
//   } else if (iosPlatforms.indexOf(platform) !== -1) {
//     return ['iOS', 'mobile']
//   } else if (windowsPlatforms.indexOf(platform) !== -1) {
//     return ['Windows', 'desktop']
//   } else if (/Android/.test(userAgent)) {
//     return ['Android', 'mobile']
//   } else if (/Linux/.test(platform)) {
//     return ['Linux', 'desktop']
//   }
//   return [null, null]
// }

// const getSources = () => {
//   const searchParams = new URLSearchParams(global.window?.location?.search)

//   return Array.from(searchParams.entries())
//     .filter(([key, _]) => key.startsWith('utm_'))
//     .reduce((p, [k, v]) => {
//       p[k.split('utm_')[1]] = v
//       return p
//     }, {})
// }

// const getScreen = () => {
//   return {
//     width: global.screen?.width,
//     height: global.screen?.height,
//     orientation:
//       global.screen?.orientation?.type?.split('-')[0] ||
//       global.window?.innerWidth > global.window?.innerHeight
//         ? 'landscape'
//         : 'portrait',
//   }
// }

// const getBrowser = () => {
//   const ua = navigator.userAgent
//   const match =
//     ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) ||
//     []
//   let temp = null
//   if (/trident/i.test(match[1])) {
//     temp = /\brv[ :]+(\d+)/g.exec(ua) || []
//     return { name: 'IE', version: temp[1] || '' }
//   } else if (match[1] === ' Chrome') {
//     temp = ua.match(/\bOPR|Edge\/(\d+)/)
//     if (temp != null) {
//       return { name: 'Opera', version: temp[1] }
//     }
//   }
//   const resolved = match[2]
//     ? [match[1], match[2]]
//     : [navigator.appName, navigator.appVersion, '-?']
//   if ((temp = ua.match(/version\/(\d+)/i)) != null) {
//     resolved.splice(1, 1, temp[1])
//   }
//   return {
//     name: resolved[0],
//     version: resolved[1],
//   }
// }

// const buildAnalytics = ({ change }) => {
//   const datetime = new Date().toISOString()
//   const referrer = global.window?.document?.referrer
//   const timezone = getTimezone()
//   const path = change.pathname
//   const userAgent = navigator.userAgent
//   const [os, platform] = getOS()
//   const sources = getSources()
//   const screen = getScreen()
//   const browser = getBrowser()

//   return {
//     datetime,
//     referrer,
//     timezone,
//     path,
//     userAgent,
//     os,
//     platform,
//     sources,
//     screen,
//     browser,
//   }
// }

const Analytics = ({ history, location, children }) => {
  useEffect(() => {
    if (isSSR) {
      return
    }

    let prevLocation = null
    const listener = (change) => {
      if (prevLocation === change.pathname) {
        return
      }
      // const analytics = buildAnalytics({ change })
      // const requestData = heartbeat(analytics)
      // requestData.headers = {
      //   'pageview-id': global.window.viewId,
      // }

      // sendRequest(requestData).success(() => {})
      prevLocation = change.pathname
    }
    listener(location)
    const unsub = history.listen(listener)

    return unsub
  }, [])
  return <React.Fragment>{children}</React.Fragment>
}

export default withRouter(withRequest(Analytics))
