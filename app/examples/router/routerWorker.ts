import { DATASET } from '../dataset';
import type {
  RouterRequest,
  RouterRequests,
  RouterResponses,
} from './messages';
import { Router, StopsIndex, Timetable, Query } from 'minotor';
import { fetchCompressedData } from '../utils';
import registerPromiseWorker from 'promise-worker/register';

let cachedRouter:
  | undefined
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
    fetchCompressedData(new URL(DATASET.timetable, self.location.origin)),
    fetchCompressedData(new URL(DATASET.stops, self.location.origin)),
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
  const router = initialize()
    .then((result) => {
      cachedRouter = { isInitialized: true, ...result };
      return result;
    })
    .catch((error: unknown) => {
      cachedRouter = undefined;
      throw error;
    });
  cachedRouter = {
    isInitialized: false,
    initializing: router,
  };

  return router;
}

const resolveArrivals = async (
  searchParams: RouterRequests['arrivalsResolution'],
): Promise<RouterResponses['arrivalsResolution']> => {
  const { router, stopsIndex } = await getRouter();
  const origin = stopsIndex.findStopBySourceStopId(searchParams.origin);
  if (!origin) throw new Error('Origin stop not found in the timetable.');
  const query = new Query.Builder()
    .from(origin.id)
    .departureTime(searchParams.departureTime)
    .maxTransfers(searchParams.maxTransfers)
    .build();
  const result = router.route(query);
  const startTimestamp = searchParams.departureTime;

  const coordinates: number[] = [];
  for (const { stop: stopId, arrival } of result.arrivals()) {
    const duration = arrival - startTimestamp;
    const stop = stopsIndex.findStopById(stopId);
    if (
      !Number.isFinite(duration) ||
      duration < 0 ||
      stop?.lon === undefined ||
      stop.lat === undefined ||
      !Number.isFinite(stop.lon) ||
      !Number.isFinite(stop.lat)
    )
      continue;
    coordinates.push(stop.lon, stop.lat, duration);
  }
  const src = new Float32Array(coordinates);
  return { src, length: src.length / 3 };
};

const resolveRoute = async (
  searchParams: RouterRequests['routing'],
): Promise<RouterResponses['routing']> => {
  const { router, stopsIndex } = await getRouter();
  const origin = stopsIndex.findStopBySourceStopId(searchParams.origin);
  if (!origin) throw new Error('Origin stop not found in the timetable.');
  const destination = stopsIndex.findStopBySourceStopId(
    searchParams.destination,
  );
  if (!destination)
    throw new Error('Destination stop not found in the timetable.');
  const query = new Query.Builder()
    .from(origin.id)
    .to(destination.id)
    .departureTime(searchParams.departureTime)
    .maxTransfers(searchParams.maxTransfers)
    .build();
  const result = router.route(query);
  const route = result.bestRoute();
  return route ? { legs: route.legs } : undefined;
};

const routerHandler = async (params: RouterRequest) => {
  switch (params.type) {
    case 'arrivalsResolution':
      return resolveArrivals(params);
    case 'routing':
      return resolveRoute(params);
  }
};

registerPromiseWorker(routerHandler);
