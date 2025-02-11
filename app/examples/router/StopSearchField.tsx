"use client";
import { StopId } from "minotor";
import { useStopsIndex } from "./StopsIndexContext";
import { FC, useEffect, useMemo, useState } from "react";

const StopSearchField: FC<
  {
    placeholder?: string;
    value: StopId;
    onChange: (newStopsId: StopId) => void;
  } & Omit<React.HTMLAttributes<HTMLDivElement>, "value" | "onChange">
> = ({ placeholder = "Search for a stop", value, onChange, ...divProps }) => {
  const stopsIndex = useStopsIndex();
  const [searchValue, setSearchValue] = useState<string>(() => {
    const stop = stopsIndex.findStopById(value);
    return stop ? stop.name : "";
  });
  const [isDropdownVisible, setIsDropdownVisible] = useState<boolean>(false);

  const handleClickOutside = (event: MouseEvent) => {
    if ((event.target as Element).closest(".relative") === null) {
      setIsDropdownVisible(false);
    }
  };

  const searchResults = useMemo(() => {
    return stopsIndex.findStopsByName(searchValue, 5);
  }, [stopsIndex, searchValue]);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchResults.length > 0) {
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
        className="border rounded-full px-4 py-2 w-full bg-white focus:outline-none focus:bg-[#f6f6f6] text-black"
      />
      {isDropdownVisible && searchValue && searchResults.length > 0 && (
        <ul className="absolute bg-white border border-gray-300 rounded-2xl mt-2 px-1 py-1 max-h-40 overflow-y-auto w-full z-10 text-black">
          {searchResults.map((stop) => (
            <li
              key={stop.id}
              onClick={() => {
                onChange(stop.id);
                setSearchValue(stop.name);
                setIsDropdownVisible(false);
              }}
              className="p-2 hover:bg-gray-200 rounded-2xl cursor-pointer"
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
