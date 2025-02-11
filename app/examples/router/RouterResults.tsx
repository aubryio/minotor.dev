"use client";
import React, { FC, useState, useEffect, useRef } from "react";
import { useRouteSearch } from "./RouteSearchContext";
import {
  Duration,
  Leg,
  Route,
  ServiceRoute,
  Stop,
  Time,
  Transfer,
  TransferType,
  VehicleLeg,
} from "minotor";
import VehicleLegItem from "./VehicleLegItem";
import TransferLegItem from "./TransferLegItem";

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

/**
 * Converts back a serialized route to a minotor route object.
 * This is required since web workers can only return basic types.
 */
const convertSerializedRouteToRoute = (
  serializedRoute: SerializedRoute,
): Route => {
  const convertLeg = (serializedLeg: SerializedLeg): VehicleLeg | Transfer => {
    if ("route" in serializedLeg) {
      const vehicleLeg: VehicleLeg = {
        from: serializedLeg.from,
        to: serializedLeg.to,
        route: serializedLeg.route,
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
        from: serializedLeg.from,
        to: serializedLeg.to,
        minTransferTime: serializedLeg?.minTransferTime
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
  const [routeResult, setRouteResult] = useState<Route | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const routeSearch = useRouteSearch();
  const workerRef = useRef<Worker>(null);

  useEffect(() => {
    workerRef.current = new Worker(
      new URL("routerWorker.ts", import.meta.url),
      {
        type: "module",
      },
    );
    workerRef.current.onmessage = (event: MessageEvent<SerializedRoute>) => {
      if (event.data !== undefined) {
        setRouteResult(convertSerializedRouteToRoute(event.data));
      } else {
        setRouteResult(undefined);
      }
      setLoading(false);
    };
    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  useEffect(() => {
    setLoading(true);
    if (workerRef.current === null) {
      return;
    }
    workerRef.current.postMessage(routeSearch);
    return;
  }, [routeSearch]);

  if (loading) {
    return <p>Loading route...</p>;
  }

  const timeline = routeResult?.legs.map((leg) => {
    if ("route" in leg) {
      return (
        <VehicleLegItem
          leg={leg}
          key={
            leg.from.id +
            leg.to.id +
            leg.route.name +
            leg.departureTime.toSeconds()
          }
        />
      );
    } else {
      return (
        <TransferLegItem leg={leg} key={leg.from.id + leg.to.id + leg.type} />
      );
    }
  });

  return <div>{routeResult ? timeline : <p>No route found.</p>}</div>;
};

export default RouterResults;
