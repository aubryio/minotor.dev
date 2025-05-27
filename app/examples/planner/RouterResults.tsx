'use client';
import React, { FC } from 'react';
import { useRouteSearch } from './RouteSearchContext';
import {
  Duration,
  Leg,
  Route,
  ServiceRoute,
  SourceStopId,
  Stop,
  Time,
  Transfer,
  TransferType,
  VehicleLeg,
} from 'minotor';
import VehicleLegItem from './VehicleLegItem';
import TransferLegItem from './TransferLegItem';
import { FaRegSadTear } from 'react-icons/fa';
import { suspensify } from '../utils';
import { promiseRouterWorker } from '../router/promiseRouterWorker';

type SearchParams = {
  origin: SourceStopId;
  destination: SourceStopId;
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

const RouterResults: FC = () => {
  const routeSearch = useRouteSearch();
  const routeResult = suspensify<Route | undefined>(
    async (searchParams: SearchParams) => {
      const routeResult = await promiseRouterWorker.postMessage({
        type: 'routing',
        ...searchParams,
      });
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

  const timeline = routeResult?.legs.map((leg) => {
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
  });

  const transfers = routeResult?.legs
    ? routeResult.legs.filter((l) => 'route' in l).length - 1
    : 0;

  return timeline ? (
    <div className="flex flex-col items-center gap-y-10">
      {routeResult?.legs && routeResult.legs.length > 0 && (
        <p className="font-bold">
          Arrival at{' '}
          <span className="text-accent">
            {routeResult?.arrivalTime().toString()}
          </span>{' '}
          {transfers > 0 ? (
            <>
              with <span className="text-accent">{transfers}</span> transfers.
            </>
          ) : (
            <>without transfers.</>
          )}
        </p>
      )}
      <div className="h-[400px] overflow-y-auto">{timeline}</div>
    </div>
  ) : (
    <div className="flex min-h-[390px] flex-col items-center">
      <FaRegSadTear className="mb-2" />
      <span>No route found.</span>
    </div>
  );
};

export default RouterResults;
