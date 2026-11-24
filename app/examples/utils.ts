import { Duration } from 'luxon';

export const fetchCompressedData = async (
  location: URL,
): Promise<Uint8Array> => {
  const response = await fetch(location, {
    headers: { Accept: 'application/octet-stream' },
  });
  if (!response.ok) {
    throw new Error(`Failed to load transit data (${response.status}).`);
  }
  if (!response.body) throw new Error('Transit data response has no body.');
  const decompressedStream = response.body.pipeThrough(
    new DecompressionStream('gzip'),
  );
  const decompressedResponse = new Response(decompressedStream);
  const arrayBuffer = await decompressedResponse.arrayBuffer();
  return new Uint8Array(arrayBuffer);
};

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

// Minotor represents times and durations in minutes.
export const timeFromDate = (date: Date): number =>
  Math.round(
    (date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds()) / 60,
  );

export const formatTime = (minutes: number): string =>
  `${String(Math.floor(minutes / 60) % 24).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
