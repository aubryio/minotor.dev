'use client';
import React, { FC, useMemo } from 'react';
import { useRouteSearch } from './RouteSearchContext';
import { Route } from 'minotor';
import VehicleLegItem from './VehicleLegItem';
import TransferLegItem from './TransferLegItem';
import { FaRegSadTear } from 'react-icons/fa';
import { formatTime, timeFromDate } from '../utils';
import { promiseRouterWorker } from '../router/promiseRouterWorker';

import { useWorkerRequest } from '../useWorkerRequest';
import type { RouterRequests } from '../router/messages';
import RouterResultsSkeleton from './RouterResultsSkeleton';

const resolveRoute = async (params: RouterRequests['routing']) => {
  const result = await promiseRouterWorker.postMessage({
    type: 'routing',
    ...params,
  });
  return result ? new Route(result.legs) : undefined;
};
const RouterResults: FC = () => {
  const { origin, destination, departureTime, nbTransfers } = useRouteSearch();
  const request = useMemo(
    () => ({
      origin,
      destination,
      departureTime: timeFromDate(departureTime),
      maxTransfers: nbTransfers,
    }),
    [origin, destination, departureTime, nbTransfers],
  );
  const {
    data: routeResult,
    loading,
    error,
    retry,
  } = useWorkerRequest(resolveRoute, request);
  if (loading) return <RouterResultsSkeleton />;
  if (error)
    return (
      <div role="alert">
        Unable to load this journey.{' '}
        <button onClick={retry} className="text-accent underline">
          Try again
        </button>
      </div>
    );

  const timeline = routeResult?.legs.map((leg) => {
    if ('route' in leg) {
      return (
        <VehicleLegItem
          leg={leg}
          key={`${leg.from.id}-${leg.to.id}-${leg.route.name}-${leg.departureTime}`}
        />
      );
    } else {
      return (
        <TransferLegItem
          leg={leg}
          key={`${leg.from.id}-${leg.to.id}-${'type' in leg ? leg.type : 'access'}`}
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
            {formatTime(routeResult.arrivalTime())}
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
