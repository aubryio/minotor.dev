'use client';
import { StopId } from 'minotor';
import { useStopsIndex } from './StopsIndexContext';
import { FC, useEffect, useMemo, useState } from 'react';

const StopSearchField: FC<
  {
    placeholder?: string;
    value: StopId;
    onChange: (newStopsId: StopId) => void;
  } & Omit<React.HTMLAttributes<HTMLDivElement>, 'value' | 'onChange'>
> = ({ placeholder = 'Search for a stop', value, onChange, ...divProps }) => {
  const stopsIndex = useStopsIndex();
  const [searchValue, setSearchValue] = useState<string>(() => {
    const stop = stopsIndex.findStopById(value);
    return stop ? stop.name : '';
  });
  const [isDropdownVisible, setIsDropdownVisible] = useState<boolean>(false);

  const handleClickOutside = (event: MouseEvent) => {
    if ((event.target as Element).closest('.relative') === null) {
      setIsDropdownVisible(false);
    }
  };

  const searchResults = useMemo(() => {
    return stopsIndex.findStopsByName(searchValue, 5);
  }, [stopsIndex, searchValue]);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchResults.length > 0) {
      const firstResult = searchResults[0];
      onChange(firstResult.id);
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
              key={stop.id}
              onClick={() => {
                onChange(stop.id);
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
