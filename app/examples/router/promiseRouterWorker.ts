'use client';
import type { RouterRequests, RouterResponses } from './messages';
import PromiseWorker from 'promise-worker';

const routerWorker = new Worker(new URL('./routerWorker.ts', import.meta.url), {
  type: 'module',
});
const worker = new PromiseWorker(routerWorker);
export const promiseRouterWorker = {
  postMessage<K extends keyof RouterRequests>(
    message: { type: K } & RouterRequests[K],
  ): Promise<RouterResponses[K]> {
    return worker.postMessage(message);
  },
};
