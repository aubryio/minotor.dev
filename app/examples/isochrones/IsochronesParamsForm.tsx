'use client';
import { FC, Suspense, useState } from 'react';
import StopSearchField from '../stopSearch/StopSearchField';
import TimePicker from '../TimePicker';
import { StopId } from 'minotor';
import {
  useIsochronesParams,
  useIsochronesParamsDispatch,
} from './IsochronesParamsContext';
import { humanizeDuration } from '../utils';
import { isIOS } from 'react-device-detect';

const MIN_RESOLUTION = 500;
const MAX_RESOLUTION = 6000;

const MIN_DURATION = 60 * 10;
const MAX_DURATION = 60 * 60 * (isIOS ? 3 : 8);

const IsochronesParamsForm: FC = () => {
  const dispatch = useIsochronesParamsDispatch();
  const isochronesParams = useIsochronesParams();
  const [localCellSize, setLocalCellSize] = useState(isochronesParams.cellSize);
  const [localMaxDuration, setLocalMaxDuration] = useState(
    isochronesParams.maxDuration,
  );

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
      <div className="mt-4 flex flex-col items-center justify-center space-y-2 sm:flex-row">
        <label htmlFor="cellSize" className="mt-[8px] sm:w-2/3">
          Resolution: {localCellSize}m
        </label>
        <input
          type="range"
          id="cellSize"
          min={MIN_RESOLUTION}
          max={MAX_RESOLUTION}
          value={MAX_RESOLUTION - localCellSize + MIN_RESOLUTION}
          onChange={(e) => {
            setLocalCellSize(
              MAX_RESOLUTION - Number(e.target.value) + MIN_RESOLUTION,
            );
          }}
          onMouseUp={() => {
            dispatch({
              type: 'set_cell_size',
              cellSize: localCellSize,
            });
          }}
          onTouchEnd={() => {
            dispatch({
              type: 'set_cell_size',
              cellSize: localCellSize,
            });
          }}
          className="w-full accent-current"
        />
      </div>
      <div className="mt-4 flex flex-col items-center justify-center space-y-2 sm:flex-row">
        <label htmlFor="cellSize" className="mt-[8px] sm:w-2/3">
          Max duration: {humanizeDuration(localMaxDuration, true)}
        </label>
        <input
          type="range"
          id="maxDuration"
          min={MIN_DURATION}
          max={MAX_DURATION}
          step={60 * 5}
          value={localMaxDuration}
          onChange={(e) => {
            setLocalMaxDuration(Number(e.target.value));
          }}
          onMouseUp={() => {
            dispatch({
              type: 'set_max_duration',
              maxDuration: localMaxDuration,
            });
          }}
          onTouchEnd={() => {
            dispatch({
              type: 'set_max_duration',
              maxDuration: localMaxDuration,
            });
          }}
          className="w-full accent-current"
        />
      </div>
    </div>
  );
};

export default IsochronesParamsForm;
