import {
  Router,
  StopsIndex,
  Timetable,
  Query,
  Time,
  Route,
  SourceStopId,
} from 'minotor';
import { fetchCompressedData } from '../utils';
import registerPromiseWorker from 'promise-worker/register';

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

async function initialize(): Promise<{
  router: Router;
  stopsIndex: StopsIndex;
}> {
  const [timetableData, stopsIndexData] = await Promise.all([
    fetchCompressedData('/2025-05-27_timetable_3.bin'),
    fetchCompressedData('/2025-05-27_stops_3.bin'),
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
  origin: SourceStopId;
  departureTime: Date;
  maxTransfers: number;
  maxDuration: number;
};

type RoutingParams = {
  type: 'routing';
  destination: SourceStopId;
  origin: SourceStopId;
  departureTime: Date;
  maxTransfers: number;
};

const resolveArrivals = async (
  searchParams: ArrivalsResolutionParams,
): Promise<{ src: Float32Array; length: number }> => {
  const { router, stopsIndex } = await getRouter();
  const query = new Query.Builder()
    .from(searchParams.origin)
    .departureTime(Time.fromDate(searchParams.departureTime))
    .maxTransfers(5)
    .build();
  const result = router.route(query);
  const startTimestamp = Time.fromDate(searchParams.departureTime).toMinutes();

  let nbArrivals = 0;
  for (const entry of result.earliestArrivals) {
    if (
      entry[1].time.toMinutes() - startTimestamp <
      searchParams.maxDuration / 60
    ) {
      nbArrivals++;
    }
  }

  const floatArray = new Float32Array(nbArrivals * 3);
  let offset = 0;
  for (const [stopId, reachingTime] of result.earliestArrivals) {
    const duration = reachingTime.time.toMinutes() - startTimestamp;
    if (duration < searchParams.maxDuration / 60) {
      const stop = stopsIndex.findStopById(stopId)!;
      const position = [stop.lon ?? 0, stop.lat ?? 0] as [number, number];

      floatArray[offset] = position[0];
      floatArray[offset + 1] = position[1];
      floatArray[offset + 2] = duration;
      offset += 3;
    }
  }
  return { src: floatArray, length: nbArrivals };
};

const resolveRoute = async (
  searchParams: RoutingParams,
): Promise<Route | undefined> => {
  const query = new Query.Builder()
    .from(searchParams.origin)
    .to(searchParams.destination)
    .departureTime(Time.fromDate(searchParams.departureTime))
    .maxTransfers(4)
    .build();
  const { router } = await getRouter();
  const result = router.route(query);
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
