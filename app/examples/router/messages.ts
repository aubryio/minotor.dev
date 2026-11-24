import type { Leg, SourceStopId } from 'minotor';

export type RouterRequests = {
  routing: {
    origin: SourceStopId;
    destination: SourceStopId;
    departureTime: number;
    maxTransfers: number;
  };
  arrivalsResolution: {
    origin: SourceStopId;
    departureTime: number;
    maxTransfers: number;
  };
};
export type ArrivalsData = { src: Float32Array; length: number };
export type RouterResponses = {
  routing: { legs: Leg[] } | undefined;
  arrivalsResolution: ArrivalsData;
};
export type RouterRequest = {
  [K in keyof RouterRequests]: { type: K } & RouterRequests[K];
}[keyof RouterRequests];
