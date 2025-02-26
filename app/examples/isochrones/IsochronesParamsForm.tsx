'use client';
import { FC, Suspense, useState } from 'react';
import { StopsIndexProvider } from '../stopSearch/StopsIndexContext';
import StopSearchField from '../stopSearch/StopSearchField';
import TimePicker from '../TimePicker';
import { StopId } from 'minotor';
import {
  useIsochronesParams,
  useIsochronesParamsDispatch,
} from './IsochronesParamsContext';

const IsochronesParamsForm: FC = () => {
  const dispatch = useIsochronesParamsDispatch();
  const isochronesParams = useIsochronesParams();
  const [localCellSize, setLocalCellSize] = useState(isochronesParams.cellSize);

  const fallbackSkeleton = (
    <div className="flex flex-col items-center justify-between space-y-2 sm:flex-row sm:items-center sm:space-x-2 sm:space-y-0">
      <label htmlFor="origin" className="self-center">
        From
      </label>
      <div className="h-10 w-52 animate-pulse rounded-full bg-gray-200"></div>
    </div>
  );
  return (
    <div>
      <div className="flex flex-col items-center justify-between space-y-2 sm:flex-row sm:items-center sm:space-x-2 sm:space-y-0">
        <Suspense fallback={fallbackSkeleton}>
          <StopsIndexProvider>
            <label htmlFor="origin" className="self-center">
              From
            </label>
            <StopSearchField
              value={isochronesParams.origin}
              onChange={(stop: StopId) => {
                dispatch({
                  type: 'set_origin',
                  origin: stop,
                });
              }}
              placeholder="Origin"
              id="origin"
            />
          </StopsIndexProvider>
        </Suspense>
        <label htmlFor="time" className="self-center">
          at
        </label>
        <TimePicker
          value={isochronesParams.departureTime}
          onChange={(time) => {
            dispatch({
              type: 'set_departure_time',
              time: time,
            });
          }}
          id="time"
        />
      </div>
      <div className="mt-4 flex flex-col items-center justify-between space-y-2 sm:flex-row">
        <label htmlFor="cellSize" className="mt-[8px] w-2/3 self-center">
          Isochrone resolution
        </label>
        <input
          type="range"
          id="cellSize"
          min="100"
          max="10000"
          value={localCellSize}
          onChange={(e) => {
            setLocalCellSize(Number(e.target.value));
          }}
          onMouseUp={() => {
            dispatch({
              type: 'set_cell_size',
              cellSize: localCellSize,
            });
          }}
          className="w-full accent-current"
        />
      </div>
    </div>
  );
};

export default IsochronesParamsForm;
