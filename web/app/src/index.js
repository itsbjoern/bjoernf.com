import ReactDOM from 'react-dom/client';

import AppServer from './AppServer';

if (process.env.NODE_ENV === 'development') {
  if (module.hot) {
    module.hot.accept();
  }
}

ReactDOM.hydrateRoot(document.getElementById('root'), <AppServer />);

window.appIsHydrated = true;
