import { hydrateRoot } from 'react-dom/client';

import AppServer from './AppServer';

hydrateRoot(document.getElementById('root'), <AppServer />);
