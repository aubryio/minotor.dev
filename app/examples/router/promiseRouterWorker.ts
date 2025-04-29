'use-client';
import PromiseWorker from 'promise-worker';

const routerWorker = new Worker(new URL('./routerWorker.ts', import.meta.url), {
  type: 'module',
});
export const promiseRouterWorker = new PromiseWorker(routerWorker);
