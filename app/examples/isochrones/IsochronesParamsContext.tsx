'use client';
import { StopId } from 'minotor';
import { createContext, Dispatch, useContext, useReducer } from 'react';
import { isIOS } from 'react-device-detect';

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
    default:
      return isochronesParamsState;
  }
};

export type IsochronesParamsState = {
  origin: StopId;
  departureTime: Date;
  cellSize: number;
  maxDuration: number;
  showTransfers: boolean;
};

export type IsochronesParamsAction =
  | { type: 'set_origin'; origin: StopId }
  | { type: 'set_departure_time'; time: Date }
  | { type: 'set_cell_size'; cellSize: number }
  | { type: 'set_max_duration'; maxDuration: number };

const initialIsochronesParamsState = {
  origin: 'Parent8504100',
  departureTime: new Date(new Date().setHours(8, 30, 0, 0)),
  cellSize: 2000,
  maxDuration: 60 * 60 * (isIOS ? 2 : 3),
  showTransfers: false,
};
