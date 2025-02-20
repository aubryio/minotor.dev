import { Router, StopsIndex, Timetable, Query, Time, StopId } from 'minotor';
import { fetchCompressedData } from './utils';
import registerPromiseWorker from 'promise-worker/register';

let cachedRouter: Router | null = null;

async function initializeRouter() {
  if (cachedRouter) {
    return cachedRouter;
  }
  const timetableLocation = '/timetable.zip';
  const stopsIndexLocation = '/stops.zip';

  const timetableData = await fetchCompressedData(timetableLocation);
  const timetable = Timetable.fromData(timetableData);

  const stopsIndexData = await fetchCompressedData(stopsIndexLocation);
  const stopsIndex = StopsIndex.fromData(stopsIndexData);

  cachedRouter = new Router(timetable, stopsIndex);

  return cachedRouter;
}
type SearchParams = {
  origin: StopId;
  destination: StopId;
  departureTime: Date;
};
const resolveRoute = async (searchParams: SearchParams) => {
  const router = await initializeRouter();

  const query = new Query.Builder()
    .from(searchParams.origin)
    .to(searchParams.destination)
    .departureTime(Time.fromDate(searchParams.departureTime))
    .maxTransfers(4)
    .build();

  const result = router.route(query);
  return result.bestRoute();
};

registerPromiseWorker(resolveRoute);
