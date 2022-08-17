import { hydrate } from 'preact';

import './index.css';
import './remirror.css';
import AppServer from './AppServer';
import reportWebVitals from './reportWebVitals';

if (process.env.NODE_ENV === 'development') {
  if (module.hot) {
    module.hot.accept();
  }
}


hydrate(<AppServer />, document.getElementById('root'));
