'use client';
import type {
  StopSearchParams,
  FindStopByIdParams,
  FindStopByLocationParams,
  SimpleStop,
} from './stopsIndexWorker';
import PromiseWorker from 'promise-worker';

const stopsIndexWorker = new Worker(
  new URL('./stopsIndexWorker.ts', import.meta.url),
  {
    type: 'module',
  },
);
const worker = new PromiseWorker(stopsIndexWorker);
type Request = StopSearchParams | FindStopByIdParams | FindStopByLocationParams;
export const promiseStopsIndexWorker = {
  postMessage<T extends Request>(
    message: T,
  ): Promise<
    T extends FindStopByIdParams ? SimpleStop | undefined : SimpleStop[]
  > {
    return worker.postMessage(message);
  },
};
