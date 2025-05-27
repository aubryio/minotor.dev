'use client';
import { SourceStopId } from 'minotor';
import { FC, useEffect, useState } from 'react';
import { promiseStopsIndexWorker } from './promiseStopsWorker';
import { SimpleStop } from './stopsIndexWorker';

const StopSearchField: FC<
  {
    placeholder?: string;
    value: SourceStopId;
    onChange: (newStopsId: SourceStopId) => void;
  } & Omit<React.HTMLAttributes<HTMLDivElement>, 'value' | 'onChange'>
> = ({ placeholder = 'Search for a stop', value, onChange, ...divProps }) => {
  const [searchValue, setSearchValue] = useState<string>('');
  const [isDropdownVisible, setIsDropdownVisible] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<SimpleStop[]>([]);

  useEffect(() => {
    const fetchStop = async () => {
      const stop = await promiseStopsIndexWorker.postMessage({
        type: 'findStopBySourceId',
        stopId: value,
      });
      setSearchValue(stop ? stop.name : '');
    };

    fetchStop();
  }, [value]);

  const handleClickOutside = (event: MouseEvent) => {
    if ((event.target as Element).closest('.relative') === null) {
      setIsDropdownVisible(false);
    }
  };

  useEffect(() => {
    const fetchStops = async () => {
      const stops = await promiseStopsIndexWorker.postMessage({
        type: 'findStopsByName',
        query: searchValue,
        maxResults: 5,
      });
      setSearchResults(stops);
    };
    fetchStops();
  }, [searchValue]);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchResults.length > 0) {
      const firstResult = searchResults[0];
      onChange(firstResult.sourceId);
      setSearchValue(firstResult.name);
      setIsDropdownVisible(false);
    }
  };

  return (
    <div className="relative" {...divProps}>
      <input
        type="text"
        value={searchValue}
        onChange={(e) => {
          setSearchValue(e.target.value);
          setIsDropdownVisible(true);
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full rounded-full border bg-white px-4 py-2 text-black focus:bg-[#f6f6f6] focus:outline-none"
      />
      {isDropdownVisible && searchValue && searchResults.length > 0 && (
        <ul className="absolute z-10 mt-2 max-h-40 w-full overflow-y-auto rounded-2xl border border-gray-300 bg-white px-1 py-1 text-black">
          {searchResults.map((stop) => (
            <li
              key={stop.sourceId}
              onClick={() => {
                onChange(stop.sourceId);
                setSearchValue(stop.name);
                setIsDropdownVisible(false);
              }}
              className="cursor-pointer rounded-2xl p-2 hover:bg-gray-200"
            >
              {stop.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default StopSearchField;
