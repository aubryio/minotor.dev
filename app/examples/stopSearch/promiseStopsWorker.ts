'use-client';
import PromiseWorker from 'promise-worker';

const stopsIndexWorker = new Worker(
  new URL('./stopsIndexWorker.ts', import.meta.url),
  {
    type: 'module',
  },
);
export const promiseStopsIndexWorker = new PromiseWorker(stopsIndexWorker);
