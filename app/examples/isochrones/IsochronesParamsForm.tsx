'use client';
import { FC, useEffect, useState } from 'react';
import StopSearchField from '../stopSearch/StopSearchField';
import TimePicker from '../TimePicker';
import { SourceStopId } from 'minotor';
import {
  useIsochronesParams,
  useIsochronesParamsDispatch,
} from './IsochronesParamsContext';
import { humanizeDuration } from '../utils';
import { isIOS } from 'react-device-detect';

const MIN_RESOLUTION = 500;
const MAX_RESOLUTION = 6000;

const MIN_DURATION = 10;
const MAX_DURATION = 60 * (isIOS ? 3 : 8);

const IsochronesParamsForm: FC = () => {
  const dispatch = useIsochronesParamsDispatch();
  const isochronesParams = useIsochronesParams();
  const [localCellSize, setLocalCellSize] = useState(isochronesParams.cellSize);

  useEffect(() => {
    const timeout = setTimeout(
      () => dispatch({ type: 'set_cell_size', cellSize: localCellSize }),
      100,
    );
    return () => clearTimeout(timeout);
  }, [dispatch, localCellSize]);

  return (
    <div>
      <div className="flex flex-col items-center justify-between space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2">
        <label htmlFor="origin" className="self-center">
          From
        </label>
        <StopSearchField
          value={isochronesParams.origin}
          onChange={(stop: SourceStopId) => {
            dispatch({
              type: 'set_origin',
              origin: stop,
            });
          }}
          placeholder="Origin"
          id="origin"
        />
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
          aria-valuetext={`${localCellSize} meters`}
          onChange={(e) => {
            setLocalCellSize(
              MAX_RESOLUTION - Number(e.target.value) + MIN_RESOLUTION,
            );
          }}
          className="w-full accent-current"
        />
      </div>
      <div className="mt-4 flex flex-col items-center justify-center space-y-2 sm:flex-row">
        <label htmlFor="maxDuration" className="mt-[8px] sm:w-2/3">
          Max duration:{' '}
          {humanizeDuration(isochronesParams.maxDuration * 60, true)}
        </label>
        <input
          type="range"
          id="maxDuration"
          min={MIN_DURATION}
          max={MAX_DURATION}
          step={5}
          value={isochronesParams.maxDuration}
          aria-valuetext={humanizeDuration(isochronesParams.maxDuration * 60)}
          onChange={(e) => {
            const maxDuration = Number(e.target.value);
            dispatch({ type: 'set_max_duration', maxDuration });
          }}
          className="w-full accent-current"
        />
      </div>
    </div>
  );
};

export default IsochronesParamsForm;
