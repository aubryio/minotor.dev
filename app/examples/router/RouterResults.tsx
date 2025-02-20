'use client';
import React, { FC } from 'react';
import { useRouteSearch } from './RouteSearchContext';
import {
  Duration,
  Leg,
  Route,
  ServiceRoute,
  Stop,
  StopId,
  Time,
  Transfer,
  TransferType,
  VehicleLeg,
} from 'minotor';
import VehicleLegItem from './VehicleLegItem';
import TransferLegItem from './TransferLegItem';
import PromiseWorker from 'promise-worker';
import { suspensify } from './utils';

type SearchParams = {
  origin: StopId;
  destination: StopId;
  departureTime: Date;
};
type SerializedDuration = { totalSeconds: number };
type SerializedTime = { secondsSinceMidnight: number };
type SerializedRoute = {
  legs: SerializedLeg[];
};
type SerializedBaseLeg = {
  from: Stop;
  to: Stop;
};
type SerializedLeg = SerializedTransfer | SerializedVehicleLeg;
type SerializedTransfer = SerializedBaseLeg & {
  minTransferTime: SerializedDuration;
  type: string;
};
type SerializedVehicleLeg = SerializedBaseLeg & {
  route: ServiceRoute;
  departureTime: SerializedTime;
  arrivalTime: SerializedTime;
};

// Converts back a serialized route to a minotor route object
const convertSerializedRouteToRoute = (
  serializedRoute: SerializedRoute,
): Route => {
  const convertLeg = (serializedLeg: SerializedLeg): VehicleLeg | Transfer => {
    if ('route' in serializedLeg) {
      const vehicleLeg: VehicleLeg = {
        ...serializedLeg,
        departureTime: Time.fromSeconds(
          serializedLeg.departureTime.secondsSinceMidnight,
        ),
        arrivalTime: Time.fromSeconds(
          serializedLeg.arrivalTime.secondsSinceMidnight,
        ),
      };
      return vehicleLeg;
    } else {
      const transfer: Transfer = {
        ...serializedLeg,
        minTransferTime: serializedLeg.minTransferTime
          ? Duration.fromSeconds(serializedLeg.minTransferTime.totalSeconds)
          : undefined,
        type: serializedLeg.type as TransferType,
      };
      return transfer;
    }
  };

  const legs = serializedRoute.legs.map(convertLeg) as Leg[];
  return new Route(legs);
};

const routerWorker = new Worker(new URL('routerWorker.ts', import.meta.url), {
  type: 'module',
});
const promiseWorker = new PromiseWorker(routerWorker);

const RouterResults: FC = () => {
  const routeSearch = useRouteSearch();
  const routeResult = suspensify<Route | undefined>(
    async (searchParams: SearchParams) => {
      const routeResult = await promiseWorker.postMessage(searchParams);
      return routeResult
        ? convertSerializedRouteToRoute(routeResult)
        : undefined;
    },
    'routeResult',
    {
      origin: routeSearch.origin,
      destination: routeSearch.destination,
      departureTime: routeSearch.departureTime,
    },
  ).read();

  const timeline = routeResult
    ? routeResult.legs.map((leg) => {
        if ('route' in leg) {
          return (
            <VehicleLegItem
              leg={leg}
              key={`${leg.from.id}-${leg.to.id}-${leg.route.name}-${leg.departureTime.toSeconds()}`}
            />
          );
        } else {
          return (
            <TransferLegItem
              leg={leg}
              key={`${leg.from.id}-${leg.to.id}-${leg.type}`}
            />
          );
        }
      })
    : [];

  return <div>{timeline}</div>;
};

export default RouterResults;
