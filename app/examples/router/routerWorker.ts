import { Router, StopsIndex, Timetable, Query, Time } from "minotor";
import { fetchCompressedData } from "./utils";

let cachedRouter: Router | null = null;

// Function to initialize and cache the Router
async function initializeRouter() {
  if (cachedRouter) {
    return cachedRouter;
  }
  const timetableLocation = "/timetable.zip";
  const stopsIndexLocation = "/stops.zip";

  const timetableData = await fetchCompressedData(timetableLocation);
  const timetable = Timetable.fromData(timetableData);

  const stopsIndexData = await fetchCompressedData(stopsIndexLocation);
  const stopsIndex = StopsIndex.fromData(stopsIndexData);

  cachedRouter = new Router(timetable, stopsIndex);

  return cachedRouter;
}

// Message handler for route search queries
self.onmessage = async function (event) {
  const routeSearch = event.data;

  const router = await initializeRouter();

  const query = new Query.Builder()
    .from(routeSearch.origin)
    .to(routeSearch.destination)
    .departureTime(Time.fromDate(routeSearch.departureTime))
    .maxTransfers(4)
    .build();

  const result = router.route(query);
  self.postMessage(result.bestRoute());
};
