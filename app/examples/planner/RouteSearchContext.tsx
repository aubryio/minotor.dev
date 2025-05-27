'use client';
import { SourceStopId } from 'minotor';
import { createContext, Dispatch, useContext, useReducer } from 'react';

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
    throw new Error('useRouteSearch must be used within a RouteSearchProvider');
  }
  return context;
}

export function useRouteSearchDispatch() {
  const context = useContext(RouteSearchDispatchContext);
  if (context === undefined) {
    throw new Error(
      'useRouteSearchDispatch must be used within a RouteSearchProvider',
    );
  }
  return context;
}

const routeSearchReducer = (
  routeSearchState: RouteSearchState,
  action: RouteSearchAction,
) => {
  switch (action.type) {
    case 'set_origin': {
      return {
        ...routeSearchState,
        origin: action.origin,
      };
    }
    case 'set_destination': {
      return {
        ...routeSearchState,
        destination: action.destination,
      };
    }
    case 'set_departure_time': {
      return {
        ...routeSearchState,
        departureTime: action.time,
      };
    }
    case 'set_nb_transfers': {
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
  origin: SourceStopId;
  destination: SourceStopId;
  departureTime: Date;
  nbTransfers: number;
};

export type RouteSearchAction =
  | { type: 'set_origin'; origin: SourceStopId }
  | { type: 'set_destination'; destination: SourceStopId }
  | { type: 'set_nb_transfers'; nbTransfers: number }
  | { type: 'set_departure_time'; time: Date };

const initialRouteSearchState = {
  origin: 'Parent8504100',
  destination: '8504880',
  departureTime: new Date(new Date().setHours(8, 30, 0, 0)),
  nbTransfers: 5,
};
