import * as ackeeTracker from './ackee';

if (typeof window !== 'undefined') {
  ackeeTracker
    .create('https://dashboard.bjornf.dev', {
      ignoreLocalhost: true,
      detailed: true,
    })
    .record('2a5590d3-ef8c-45ab-9b29-7f14459e092f');
}
