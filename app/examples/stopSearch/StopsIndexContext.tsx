'use client';

import { StopsIndex } from 'minotor';
import React, { createContext, useContext } from 'react';
import { fetchCompressedData, suspensify } from '../utils';

const stopsIndexLocation = '/stops.zip';

const fetchStopsIndex = async (): Promise<StopsIndex> => {
  const stopsIndexData = await fetchCompressedData(stopsIndexLocation);
  return StopsIndex.fromData(stopsIndexData);
};

const stopsIndexResource = suspensify<StopsIndex>(
  () => fetchStopsIndex(),
  'fetchStopsIndex',
);

const StopsIndexContext = createContext<StopsIndex | undefined>(undefined);

export const StopsIndexProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const stopsIndex = stopsIndexResource.read();

  return (
    <StopsIndexContext.Provider value={stopsIndex}>
      {children}
    </StopsIndexContext.Provider>
  );
};

export const useStopsIndex = () => {
  const context = useContext(StopsIndexContext);
  if (context === undefined) {
    throw new Error('useStopsIndex must be used within a StopsIndexProvider');
  }
  return context;
};
