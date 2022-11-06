import { hydrate } from 'preact/compat';

import App from './AppClient';

hydrate(<App />, document.getElementById('root'));
