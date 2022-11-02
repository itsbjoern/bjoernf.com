import { hydrateRoot } from 'react-dom/client';

import App from './AppClient';

hydrateRoot(document.getElementById('root'), <App />);
