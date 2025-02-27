'use client';
import { StopId } from 'minotor';
import { createContext, Dispatch, useContext, useReducer } from 'react';

const IsochronesParamsContext = createContext<
  IsochronesParamsState | undefined
>(undefined);

const IsochronesParamsDispatchContext = createContext<
  Dispatch<IsochronesParamsAction> | undefined
>(undefined);

export const IsochronesParamsProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [isochronesParamsState, dispatch] = useReducer(
    isochronesParamsReducer,
    initialIsochronesParamsState,
  );
  return (
    <IsochronesParamsContext.Provider value={isochronesParamsState}>
      <IsochronesParamsDispatchContext.Provider value={dispatch}>
        {children}
      </IsochronesParamsDispatchContext.Provider>
    </IsochronesParamsContext.Provider>
  );
};

export function useIsochronesParams() {
  const context = useContext(IsochronesParamsContext);
  if (context === undefined) {
    throw new Error(
      'useIsochronesParams must be used within a IsochronesParamsProvider',
    );
  }
  return context;
}

export function useIsochronesParamsDispatch() {
  const context = useContext(IsochronesParamsDispatchContext);
  if (context === undefined) {
    throw new Error(
      'useIsochronesParamsDispatch must be used within a IsochronesParamsProvider',
    );
  }
  return context;
}

const isochronesParamsReducer = (
  isochronesParamsState: IsochronesParamsState,
  action: IsochronesParamsAction,
) => {
  switch (action.type) {
    case 'set_origin': {
      return {
        ...isochronesParamsState,
        origin: action.origin,
      };
    }
    case 'set_departure_time': {
      return {
        ...isochronesParamsState,
        departureTime: action.time,
      };
    }
    case 'set_nb_transfers': {
      return {
        ...isochronesParamsState,
        nbTransfers: action.nbTransfers,
      };
    }
    case 'set_cell_size': {
      return {
        ...isochronesParamsState,
        cellSize: action.cellSize,
      };
    }
    case 'set_max_duration': {
      return {
        ...isochronesParamsState,
        maxDuration: action.maxDuration,
      };
    }
    case 'set_show_transfers': {
      return {
        ...isochronesParamsState,
        showTransfers: action.showTransfers,
      };
    }
    default:
      return isochronesParamsState;
  }
};

export type IsochronesParamsState = {
  origin: StopId;
  departureTime: Date;
  nbTransfers: number;
  cellSize: number;
  maxDuration: number;
  showTransfers: boolean;
};

export type IsochronesParamsAction =
  | { type: 'set_origin'; origin: StopId }
  | { type: 'set_nb_transfers'; nbTransfers: number }
  | { type: 'set_departure_time'; time: Date }
  | { type: 'set_cell_size'; cellSize: number }
  | { type: 'set_max_duration'; maxDuration: number }
  | { type: 'set_show_transfers'; showTransfers: boolean };

const initialIsochronesParamsState = {
  origin: 'Parent8504100',
  departureTime: new Date(new Date().setHours(8, 30, 0, 0)),
  nbTransfers: 5,
  cellSize: 4000,
  maxDuration: 60 * 60 * 4,
  showTransfers: false,
};
