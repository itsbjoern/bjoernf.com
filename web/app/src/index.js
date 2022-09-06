import { hydrate } from 'preact';

import AppServer from './AppServer';

if (process.env.NODE_ENV === 'development') {
  if (module.hot) {
    module.hot.accept();
  }
}

hydrate(<AppServer />, document.getElementById('root'));
