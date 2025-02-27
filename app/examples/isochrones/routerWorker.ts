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
    .map(([stopId, reachingTime]: [StopId, ReachingTime]) => {
      const stop = stopsIndex.findStopById(stopId)!;
      return {
        position: [stop.lon ?? 0, stop.lat ?? 0],
        duration: reachingTime.time.toSeconds() - startTimestamp,
        transfers: reachingTime.legNumber - 1,
      };
    })
    .filter((entry) => entry.duration < 60 * 60 * 8);
  return arrivals;
};

registerPromiseWorker(resolveArrivals);
