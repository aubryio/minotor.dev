import React, { FC } from 'react';

const RouterResultsSkeleton: FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex animate-pulse space-x-4 shadow-lg">
        <div className="flex w-8 flex-col items-center justify-center">
          <div className="h-6 w-6 rounded-full bg-gray-300"></div>
          <div className="mt-2 h-3 w-8 rounded bg-gray-300"></div>
        </div>
        <div className="flex w-60 flex-1 flex-col space-y-4 border-l-4 border-gray-300 p-4">
          <div className="space-y-2">
            <div className="h-3 w-full rounded bg-gray-300"></div>
            <div className="h-3 w-1/4 rounded bg-gray-300"></div>
          </div>
          <div className="space-y-2">
            <div className="w-2/2 h-3 rounded bg-gray-300"></div>
            <div className="h-3 w-1/4 rounded bg-gray-300"></div>
          </div>
        </div>
      </div>
      <div className="flex animate-pulse space-x-4 shadow-lg">
        <div className="flex w-8 flex-col items-center justify-center">
          <div className="h-6 w-6 rounded-full bg-gray-300"></div>
        </div>
        <div className="flex w-60 flex-1 flex-col space-y-4 border-l-4 border-gray-300 p-4">
          <div className="space-y-2">
            <div className="h-3 w-1/3 rounded bg-gray-300"></div>
          </div>
        </div>
      </div>
      <div className="flex animate-pulse space-x-4 shadow-lg">
        <div className="flex w-8 flex-col items-center justify-center">
          <div className="h-6 w-6 rounded-full bg-gray-300"></div>
          <div className="mt-2 h-3 w-8 rounded bg-gray-300"></div>
        </div>
        <div className="flex w-60 flex-1 flex-col space-y-4 border-l-4 border-gray-300 p-4">
          <div className="space-y-2">
            <div className="h-3 w-full rounded bg-gray-300"></div>
            <div className="h-3 w-1/4 rounded bg-gray-300"></div>
          </div>
          <div className="space-y-2">
            <div className="w-2/2 h-3 rounded bg-gray-300"></div>
            <div className="h-3 w-1/4 rounded bg-gray-300"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouterResultsSkeleton;
