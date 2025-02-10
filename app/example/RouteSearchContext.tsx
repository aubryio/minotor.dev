"use client";
import { Result, StopId, Time } from "minotor";
import { createContext, Dispatch, useContext, useReducer } from "react";

const RouteSearchContext = createContext<RouteSearchState | undefined>(
  undefined,
);

const RouteSearchDispatchContext = createContext<
  Dispatch<RouteSearchAction> | undefined
>(undefined);

export const RouteSearchProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [routeSearchState, dispatch] = useReducer(
    routeSearchReducer,
    initialRouteSearchState,
  );

  return (
    <RouteSearchContext.Provider value={routeSearchState}>
      <RouteSearchDispatchContext.Provider value={dispatch}>
        {children}
      </RouteSearchDispatchContext.Provider>
    </RouteSearchContext.Provider>
  );
};

export function useRouteSearch() {
  const context = useContext(RouteSearchContext);
  if (context === undefined) {
    throw new Error("useRouteSearch must be used within a RouteSearchProvider");
  }
  return context;
}

export function useRouteSearchDispatch() {
  const context = useContext(RouteSearchDispatchContext);
  if (context === undefined) {
    throw new Error(
      "useRouteSearchDispatch must be used within a RouteSearchProvider",
    );
  }
  return context;
}

const routeSearchReducer = (
  routeSearchState: RouteSearchState,
  action: RouteSearchAction,
) => {
  switch (action.type) {
    case "set_origin": {
      return {
        ...routeSearchState,
        origin: action.origin,
      };
    }
    case "set_destination": {
      return {
        ...routeSearchState,
        destination: action.destination,
      };
    }
    case "set_departure_time": {
      return {
        ...routeSearchState,
        departureTime: action.time,
      };
    }
    case "set_nb_transfers": {
      return {
        ...routeSearchState,
        nbTransfers: action.nbTransfers,
      };
    }
    default:
      return routeSearchState;
  }
};

export type RouteSearchState = {
  origin: StopId;
  destination: StopId;
  departureTime: Time;
  nbTransfers: number;
  result?: Result;
};

export type RouteSearchAction =
  | { type: "set_origin"; origin: StopId }
  | { type: "set_destination"; destination: StopId }
  | { type: "set_nb_transfers"; nbTransfers: number }
  | { type: "set_departure_time"; time: Time };

const initialRouteSearchState = {
  origin: "",
  destination: "",
  departureTime: Time.fromDate(new Date()),
  nbTransfers: 5,
};
