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
  stopId: StopId;
};

const resolveArrivals = async (
  searchParams: ArrivalsResolutionParams,
): Promise<ArrivalTime[]> => {
  const { router, stopsIndex } = await getRouter();
  const query = new Query.Builder()
    .from(searchParams.origin)
    .departureTime(Time.fromDate(searchParams.departureTime))
    .maxTransfers(5)
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
    .map(([stopId, reachingTime]: [StopId, ReachingTime]) => {
      const stop = stopsIndex.findStopById(stopId)!;
      return {
        position: [stop.lon ?? 0, stop.lat ?? 0] as [number, number],
        duration: reachingTime.time.toSeconds() - startTimestamp,
        transfers: reachingTime.legNumber - 1,
        stopId: stop.id,
      };
    })
    .filter((entry) => entry.duration < 60 * 60 * 8);
  return arrivals;
};

const resolveRoute = async (
  searchParams: RoutingParams,
): Promise<Route | undefined> => {
  const query = new Query.Builder()
    .from(searchParams.origin)
    .to(searchParams.destination)
    .departureTime(Time.fromDate(searchParams.departureTime))
    .maxTransfers(5)
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
