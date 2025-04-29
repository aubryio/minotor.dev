'use client';
import { FC, Suspense } from 'react';
import StopSearchField from '../stopSearch/StopSearchField';
import TimePicker from '../TimePicker';
import { StopId } from 'minotor';
import { useRouteSearch, useRouteSearchDispatch } from './RouteSearchContext';

const SearchForm: FC = () => {
  const dispatch = useRouteSearchDispatch();
  const routeSearch = useRouteSearch();

  const fallbackSkeleton = (
    <div className="flex flex-col items-center justify-between space-y-2 sm:flex-row sm:items-center sm:space-x-2 sm:space-y-0">
      <label htmlFor="origin" className="self-center">
        From
      </label>
      <div className="h-10 w-52 animate-pulse rounded-full bg-gray-200"></div>
      <label htmlFor="destination" className="self-center">
        to
      </label>
      <div className="h-10 w-52 animate-pulse rounded-full bg-gray-200"></div>
    </div>
  );
  return (
    <div className="flex flex-col items-center justify-between space-y-2 sm:flex-row sm:items-center sm:space-x-2 sm:space-y-0">
      <Suspense fallback={fallbackSkeleton}>
        <label htmlFor="origin" className="self-center">
          From
        </label>
        <StopSearchField
          value={routeSearch.origin}
          onChange={(stop: StopId) => {
            dispatch({
              type: 'set_origin',
              origin: stop,
            });
          }}
          placeholder="Origin"
          id="origin"
        />
        <label htmlFor="destination" className="self-center">
          to
        </label>
        <StopSearchField
          value={routeSearch.destination}
          onChange={(stop) => {
            dispatch({
              type: 'set_destination',
              destination: stop,
            });
          }}
          placeholder="Destination"
          id="destination"
        />
      </Suspense>
      <label htmlFor="time" className="self-center">
        at
      </label>
      <TimePicker
        value={routeSearch.departureTime}
        onChange={(time) => {
          dispatch({
            type: 'set_departure_time',
            time: time,
          });
        }}
        id="time"
      />
    </div>
  );
};

export default SearchForm;
