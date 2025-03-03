import {
  Router,
  StopsIndex,
  Timetable,
  Query,
  Time,
  StopId,
  ReachingTime,
} from 'minotor';
import { fetchCompressedData } from '../utils';
import registerPromiseWorker from 'promise-worker/register';

let cachedRouter: Router | null = null;
let cachedStopsIndex: StopsIndex | null = null;

async function initializeRouter(): Promise<{
  router: Router;
  stopsIndex: StopsIndex;
}> {
  if (cachedRouter && cachedStopsIndex) {
    return { router: cachedRouter, stopsIndex: cachedStopsIndex };
  }
  const timetableLocation = '/timetable.zip';
  const stopsIndexLocation = '/stops.zip';

  const timetableData = await fetchCompressedData(timetableLocation);
  const timetable = Timetable.fromData(timetableData);

  if (!cachedStopsIndex) {
    const stopsIndexData = await fetchCompressedData(stopsIndexLocation);
    cachedStopsIndex = StopsIndex.fromData(stopsIndexData);
  }
  cachedRouter = new Router(timetable, cachedStopsIndex);

  return { router: cachedRouter, stopsIndex: cachedStopsIndex };
}

type SearchParams = {
  origin: StopId;
  departureTime: Date;
};

const resolveArrivals = async (searchParams: SearchParams) => {
  const { router, stopsIndex } = await initializeRouter();
  const query = new Query.Builder()
    .from(searchParams.origin)
    .departureTime(Time.fromDate(searchParams.departureTime))
    .to([])
    .maxTransfers(4)
    .build();

  const result = router.route(query);
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
    (entry) => entry.duration < 60 * 60 * 8,
  );
  return filteredArrivals;
};

registerPromiseWorker(resolveArrivals);
