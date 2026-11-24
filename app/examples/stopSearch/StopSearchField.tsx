'use client';
import type { SourceStopId } from 'minotor';
import {
  useEffect,
  useId,
  useRef,
  useState,
  type InputHTMLAttributes,
} from 'react';
import { promiseStopsIndexWorker } from './promiseStopsWorker';
import { useWorkerRequest } from '../useWorkerRequest';

const findStop = (stopId: SourceStopId) =>
  promiseStopsIndexWorker.postMessage({ type: 'findStopBySourceId', stopId });
const searchStops = (query: string) =>
  query.trim()
    ? promiseStopsIndexWorker.postMessage({
        type: 'findStopsByName',
        query,
        maxResults: 5,
      })
    : Promise.resolve([]);

type Props = {
  value: SourceStopId;
  onChange: (stop: SourceStopId) => void;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'>;

export default function StopSearchField({
  value,
  onChange,
  id,
  placeholder = 'Search for a stop',
  ...props
}: Props) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const listId = `${inputId}-results`;
  const root = useRef<HTMLDivElement>(null);
  const selected = useWorkerRequest(findStop, value);
  const [draft, setDraft] = useState<{ value: SourceStopId; text: string }>();
  const searchValue =
    draft?.value === value ? draft.text : (selected.data?.name ?? '');
  const results = useWorkerRequest(searchStops, searchValue, {
    keepPreviousData: true,
  });
  const stops = results.data ?? [];
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const visible = open && !!searchValue.trim() && !results.error;
  const activeIndex = highlighted < stops.length ? highlighted : -1;

  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target))
        setOpen(false);
    };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, []);

  const select = (index: number) => {
    const stop = stops[index];
    if (!stop) return;
    setDraft({ value: stop.sourceId, text: stop.name });
    onChange(stop.sourceId);
    setOpen(false);
    setHighlighted(-1);
  };

  return (
    <div
      ref={root}
      className="relative"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <input
        {...props}
        id={inputId}
        type="text"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={visible}
        aria-controls={listId}
        aria-activedescendant={
          visible && activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined
        }
        aria-describedby={
          selected.error || results.error ? `${inputId}-error` : undefined
        }
        value={searchValue}
        placeholder={placeholder}
        autoComplete="off"
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          setDraft({ value, text: event.target.value });
          setHighlighted(-1);
          setOpen(true);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            setOpen(false);
            setHighlighted(-1);
          } else if (
            (event.key === 'ArrowDown' || event.key === 'ArrowUp') &&
            stops.length
          ) {
            event.preventDefault();
            setOpen(true);
            setHighlighted(
              event.key === 'ArrowDown'
                ? (activeIndex + 1) % stops.length
                : activeIndex <= 0
                  ? stops.length - 1
                  : activeIndex - 1,
            );
          } else if (event.key === 'Enter' && visible) {
            event.preventDefault();
            select(activeIndex >= 0 ? activeIndex : 0);
          }
        }}
        className="w-full rounded-full border bg-white px-4 py-2 text-black focus:bg-[#f6f6f6]"
      />
      <span role="status" className="sr-only">
        {selected.loading || results.loading
          ? 'Loading stops...'
          : open && searchValue && !stops.length
            ? 'No stops found.'
            : ''}
      </span>
      {(selected.error || results.error) && (
        <div id={`${inputId}-error`} role="alert" className="mt-2 text-sm">
          Unable to load stops.{' '}
          <button
            type="button"
            className="text-accent underline"
            onClick={() => {
              selected.retry();
              results.retry();
            }}
          >
            Try again
          </button>
        </div>
      )}
      {visible && (
        <ul
          id={listId}
          role="listbox"
          aria-busy={results.loading}
          className="absolute z-10 mt-2 max-h-40 w-full overflow-y-auto rounded-2xl border border-gray-300 bg-white p-1 text-black"
        >
          {!stops.length && (
            <li role="presentation" className="p-2 text-gray-500">
              {results.loading ? 'Loading stops...' : 'No stops found.'}
            </li>
          )}
          {stops.map((stop, index) => (
            <li
              id={`${listId}-${index}`}
              key={stop.sourceId}
              role="option"
              aria-selected={index === activeIndex}
              onPointerDown={(event) => event.preventDefault()}
              onClick={() => select(index)}
              className={`cursor-pointer rounded-2xl p-2 hover:bg-gray-200 ${index === activeIndex ? 'bg-gray-200' : ''}`}
            >
              {stop.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
