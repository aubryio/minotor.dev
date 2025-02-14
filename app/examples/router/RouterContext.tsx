'use client';
import { Router, StopsIndex, Timetable } from 'minotor';
import React, { createContext, useContext } from 'react';
import { fetchCompressedData, suspensify } from './utils';

const timetableLocation = '/timetable.zip';
const stopsIndexLocation = '/stops.zip';

const fetchRouter = async (): Promise<Router> => {
  const timetableData = await fetchCompressedData(timetableLocation);
  const timetable = Timetable.fromData(timetableData);

  const stopsIndexData = await fetchCompressedData(stopsIndexLocation);
  const stopsIndex = StopsIndex.fromData(stopsIndexData);
  return new Router(timetable, stopsIndex);
};

const routerResource = suspensify<Router>(fetchRouter());

const RouterContext = createContext<Router | undefined>(undefined);

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = routerResource.read();

  return (
    <RouterContext.Provider value={router}>{children}</RouterContext.Provider>
  );
};

export const useRouter = () => {
  const context = useContext(RouterContext);
  if (context === undefined) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
};
