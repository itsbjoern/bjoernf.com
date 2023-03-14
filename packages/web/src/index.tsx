import { hydrate } from 'react';

import App from './AppClient';

hydrate(<App />, document.getElementById('root')!);
