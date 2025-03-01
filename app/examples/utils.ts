/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { Duration } from 'luxon';
import { setOptions, unzip } from 'unzipit';

setOptions({ workerURL: '/workers/unzipit-worker.module.js' });

export const fetchCompressedData = async (
  location: string,
): Promise<Uint8Array> => {
  const response = await fetch(location);
  const blob = await response.blob();
  const { entries: entries } = await unzip(blob);
  const file = await entries[Object.keys(entries)[0]].blob();
  const arrayBuffer = await file.arrayBuffer();
  return new Uint8Array(arrayBuffer);
};

type SuspenseResult<T> = {
  read: () => T;
};

const cache = new Map<string, SuspenseResult<unknown>>();

export function suspensify<T>(
  promiseFactory: (...args: any[]) => Promise<T>,
  key: string,
  ...args: any[]
): SuspenseResult<T> {
  const cacheKey = `${key}:${JSON.stringify(args)}`;

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey) as SuspenseResult<T>;
  }

  let status: 'pending' | 'success' | 'error' = 'pending';
  let result: T;
  let error: unknown;

  const promise = promiseFactory(...args).then(
    (r) => {
      status = 'success';
      result = r;
    },
    (e) => {
      status = 'error';
      error = e;
    },
  );

  const suspenseResult: SuspenseResult<T> = {
    read() {
      if (status === 'pending') {
        throw promise;
      } else if (status === 'error') {
        throw error;
      } else {
        return result;
      }
    },
  };

  cache.set(cacheKey, suspenseResult);
  return suspenseResult;
}

export const humanizeDuration = (durationInSeconds: number, short = false) => {
  const duration = Duration.fromObject({
    seconds: durationInSeconds,
  });
  if (short) {
    return duration
      .toFormat("h'h'm'min's's'", { floor: true })
      .replace(/^0h/, '')
      .replace(/(?<!(^|\d))0min/, '')
      .replace(/(?<!(^|\d))0s$/, '');
  }
  return duration
    .toFormat("h 'hours' m 'minutes' s 'seconds'", { floor: true })
    .replace(/^0 hours /, '')
    .replace(/ 0 minutes /, '')
    .replace(/ 0 seconds$/, '');
};
