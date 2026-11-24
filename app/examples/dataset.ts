const date = '2026-11-23';

export const DATASET = {
  date,
  label: 'Monday November 23rd 2026',
  timetable: `/${date}_timetable.bin`,
  stops: `/${date}_stops.bin`,
} as const;
