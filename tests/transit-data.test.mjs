import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { test } from 'node:test';
import { Query, Route, Router, StopsIndex, Timetable } from 'minotor';

const readData = (name) =>
  gunzipSync(
    readFileSync(new URL(`../public/2026-11-23_${name}.bin`, import.meta.url)),
  );
const stops = StopsIndex.fromData(readData('stops'));
const timetable = Timetable.fromData(readData('timetable'));
const router = new Router(timetable, stops);
const origin = stops.findStopBySourceStopId('Parentch:1:sloid:4100');
const destination = stops.findStopBySourceStopId('Parentch:1:sloid:4880');

test('bundled data supports stop search and the default planner journey', () => {
  assert.ok(origin);
  assert.ok(destination);
  assert.ok(stops.findStopsByName('Fribourg').length > 0);
  const result = router.route(
    new Query.Builder()
      .from(origin.id)
      .to(destination.id)
      .departureTime(8 * 60 + 30)
      .maxTransfers(4)
      .build(),
  );
  const route = result.bestRoute();
  assert.ok(route);
  assert.ok(route.arrivalTime() >= 8 * 60 + 30);
  // Workers clone plain numeric legs; only the Route prototype needs restoring.
  const restored = new Route(structuredClone(route).legs);
  assert.equal(restored.arrivalTime(), route.arrivalTime());
  assert.ok(restored.legs.some((leg) => 'route' in leg));
});

test('isochrone arrivals contain reachable stops with usable map coordinates', () => {
  const departure = 8 * 60 + 30;
  const result = router.route(
    new Query.Builder()
      .from(origin.id)
      .departureTime(departure)
      .maxTransfers(5)
      .build(),
  );
  const arrivals = [...result.arrivals()].filter(
    ({ arrival }) => arrival - departure < 180,
  );
  assert.ok(arrivals.length > 100);
  for (const { stop, arrival } of arrivals) {
    assert.ok(Number.isFinite(arrival));
    assert.ok(arrival >= departure);
    const location = stops.findStopById(stop);
    assert.ok(Number.isFinite(location?.lat));
    assert.ok(Number.isFinite(location?.lon));
  }
});
