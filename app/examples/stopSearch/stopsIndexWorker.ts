import { DATASET } from '../dataset';
import { StopsIndex, SourceStopId, Stop } from 'minotor';
import { fetchCompressedData } from '../utils';
import registerPromiseWorker from 'promise-worker/register';

const hasSourceId = (stop: Stop): stop is Stop & { sourceStopId: string } =>
  stop.sourceStopId !== undefined;

let cachedIndex:
  | undefined
  | {
      isInitialized: true;
      stopsIndex: StopsIndex;
    }
  | {
      isInitialized: false;
      initializing: Promise<{
        stopsIndex: StopsIndex;
      }>;
    };

async function initialize(): Promise<{
  stopsIndex: StopsIndex;
}> {
  const stopsIndexData = await fetchCompressedData(
    new URL(DATASET.stops, self.location.origin),
  );
  const stopsIndex = StopsIndex.fromData(stopsIndexData);
  const result = { stopsIndex: stopsIndex };
  return result;
}

async function getStopsIndex(): Promise<{
  stopsIndex: StopsIndex;
}> {
  if (cachedIndex) {
    if (cachedIndex.isInitialized) {
      return cachedIndex;
    } else {
      return cachedIndex.initializing;
    }
  }
  const router = initialize()
    .then((result) => {
      cachedIndex = { isInitialized: true, ...result };
      return result;
    })
    .catch((error: unknown) => {
      cachedIndex = undefined;
      throw error;
    });
  cachedIndex = {
    isInitialized: false,
    initializing: router,
  };

  return router;
}

export type StopSearchParams = {
  type: 'findStopsByName';
  query: string;
  maxResults?: number;
};

export type FindStopByIdParams = {
  type: 'findStopBySourceId';
  stopId: SourceStopId;
};

export type FindStopByLocationParams = {
  type: 'findStopsByLocation';
  lat: number;
  lon: number;
  maxResults: number;
  radius: number;
};

const searchStops = async (
  searchParams: StopSearchParams,
): Promise<SimpleStop[]> => {
  const { stopsIndex } = await getStopsIndex();

  const stops = stopsIndex
    .findStopsByName(searchParams.query, searchParams.maxResults)
    .filter(hasSourceId)
    .filter((stop) => Number.isFinite(stop.lat) && Number.isFinite(stop.lon))
    .map((stop) => ({
      sourceId: stop.sourceStopId,
      name: stop.name,
      lat: stop.lat as number,
      lon: stop.lon as number,
    }));
  return stops;
};

const findStopBySourceId = async (
  findStopParams: FindStopByIdParams,
): Promise<SimpleStop | undefined> => {
  const { stopsIndex } = await getStopsIndex();

  const stop = stopsIndex.findStopBySourceStopId(findStopParams.stopId);
  if (
    !stop ||
    !hasSourceId(stop) ||
    stop.lat === undefined ||
    stop.lon === undefined ||
    !Number.isFinite(stop.lat) ||
    !Number.isFinite(stop.lon)
  ) {
    return undefined;
  }
  return {
    sourceId: stop.sourceStopId,
    name: stop.name,
    lat: stop.lat,
    lon: stop.lon,
  };
};

export type SimpleStop = {
  sourceId: SourceStopId;
  name: string;
  lat: number;
  lon: number;
};

const findStopsByLocation = async (
  findStopParams: FindStopByLocationParams,
): Promise<SimpleStop[]> => {
  const { stopsIndex } = await getStopsIndex();
  return stopsIndex
    .findStopsByLocation(
      findStopParams.lat,
      findStopParams.lon,
      findStopParams.maxResults,
      findStopParams.radius,
    )
    .filter((stop) => stop.lat !== undefined && stop.lon !== undefined)
    .filter(hasSourceId)
    .filter((stop) => Number.isFinite(stop.lat) && Number.isFinite(stop.lon))
    .map((stop) => ({
      sourceId: stop.sourceStopId,
      name: stop.name,
      lat: stop.lat as number,
      lon: stop.lon as number,
    }));
};

const stopsIndexHandler = async (
  params: StopSearchParams | FindStopByIdParams | FindStopByLocationParams,
) => {
  switch (params.type) {
    case 'findStopsByName':
      return searchStops(params);
    case 'findStopBySourceId':
      return findStopBySourceId(params);
    case 'findStopsByLocation':
      return findStopsByLocation(params);
  }
};

registerPromiseWorker(stopsIndexHandler);
