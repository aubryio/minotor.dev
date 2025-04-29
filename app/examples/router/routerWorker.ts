import {
  Router,
  StopsIndex,
  Timetable,
  Query,
  Time,
  StopId,
  ReachingTime,
  Result,
  Route,
} from 'minotor';
import { fetchCompressedData } from '../utils';
import registerPromiseWorker from 'promise-worker/register';
import { WeakLRUCache } from 'weak-lru-cache';
import { isMobile } from 'react-device-detect';

let cachedRouter:
  | {
      isInitialized: true;
      router: Router;
      stopsIndex: StopsIndex;
    }
  | {
      isInitialized: false;
      initializing: Promise<{
        router: Router;
        stopsIndex: StopsIndex;
      }>;
    };

type QueryKey = string;
const queryCache = new WeakLRUCache<QueryKey, Result>({ cacheSize: 50 });
const queryKey = (query: Query): QueryKey => {
  return `${query.departureTime}-${query.from}-${query.options.maxTransfers}-${query.to.join(',')}`;
};

async function initialize(): Promise<{
  router: Router;
  stopsIndex: StopsIndex;
}> {
  const [timetableData, stopsIndexData] = await Promise.all([
    fetchCompressedData('/2025-04-28_timetable.bin'),
    fetchCompressedData('/2025-04-28_stops.bin'),
  ]);
  const timetable = Timetable.fromData(timetableData);
  const stopsIndex = StopsIndex.fromData(stopsIndexData);
  const router = new Router(timetable, stopsIndex);
  const result = { router, stopsIndex: stopsIndex };
  return result;
}

async function getRouter(): Promise<{
  router: Router;
  stopsIndex: StopsIndex;
}> {
  if (cachedRouter) {
    if (cachedRouter.isInitialized) {
      return cachedRouter;
    } else {
      return cachedRouter.initializing;
    }
  }
  const router = initialize().then((result) => {
    cachedRouter = { isInitialized: true, ...result };
    return result;
  });
  cachedRouter = {
    isInitialized: false,
    initializing: router,
  };

  return router;
}

type ArrivalsResolutionParams = {
  type: 'arrivalsResolution';
  origin: StopId;
  departureTime: Date;
  maxTransfers: number;
};

type RoutingParams = {
  type: 'routing';
  destination: StopId;
  origin: StopId;
  departureTime: Date;
  maxTransfers: number;
};

export type ArrivalTime = {
  duration: number;
  transfers: number;
  position: [number, number];
};

const resolveArrivals = async (
  searchParams: ArrivalsResolutionParams,
): Promise<ArrivalTime[]> => {
  const { router, stopsIndex } = await getRouter();
  const query = new Query.Builder()
    .from(searchParams.origin)
    .departureTime(Time.fromDate(searchParams.departureTime))
    .maxTransfers(isMobile ? 4 : 5)
    .build();
  const key = queryKey(query);
  let result = queryCache.getValue(key);
  if (!result) {
    result = router.route(query);
    queryCache.setValue(key, result);
  }
  const startTimestamp = Time.fromDate(searchParams.departureTime).toSeconds();
  const arrivals = Array.from(result.earliestArrivals)
    .filter(([stopId]) => {
      const stop = stopsIndex.findStopById(stopId);
      return stop !== undefined;
    })
    .reduce(
      // only keep one entry per equivalent stop group to reduce rendering time
      (acc, [stopId, reachingTime]: [StopId, ReachingTime]) => {
        const stop = stopsIndex.findStopById(stopId)!;
        const parentStopId = stop.parent ?? stopId;
        const duration = reachingTime.time.toSeconds() - startTimestamp;
        if (!acc[parentStopId] || acc[parentStopId].duration > duration) {
          acc[parentStopId] = {
            position: [stop.lon ?? 0, stop.lat ?? 0],
            duration,
            transfers: reachingTime.legNumber - 1,
          };
        }
        return acc;
      },
      {} as Record<
        StopId,
        { position: [number, number]; duration: number; transfers: number }
      >,
    );
  const filteredArrivals = Object.values(arrivals).filter(
    (entry) => entry.duration < 60 * 60 * (isMobile ? 4 : 8),
  );
  return filteredArrivals;
};

const resolveRoute = async (
  searchParams: RoutingParams,
): Promise<Route | undefined> => {
  const query = new Query.Builder()
    .from(searchParams.origin)
    .to(searchParams.destination)
    .departureTime(Time.fromDate(searchParams.departureTime))
    .maxTransfers(isMobile ? 4 : 5)
    .build();
  const key = queryKey(query);
  let result = queryCache.getValue(key);
  if (!result) {
    const { router } = await getRouter();
    result = router.route(query);
    queryCache.setValue(key, result);
  }
  return result.bestRoute(searchParams.destination);
};

const routerHandler = async (
  params: RoutingParams | ArrivalsResolutionParams,
) => {
  switch (params.type) {
    case 'arrivalsResolution':
      return resolveArrivals(params as ArrivalsResolutionParams);
    case 'routing':
      return resolveRoute(params as RoutingParams);
  }
};

registerPromiseWorker(routerHandler);
