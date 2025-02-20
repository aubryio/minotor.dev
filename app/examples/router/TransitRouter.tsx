'use client';
import { FC, Suspense } from 'react';
import { RouteSearchProvider } from './RouteSearchContext';
import SearchForm from './SearchForm';
import RouterResults from './RouterResults';
import RouterResultsSkeleton from './RouterResultsSkeleton';

const TransitRouter: FC = () => {
  return (
    <RouteSearchProvider>
      <div className="flex flex-col items-center space-y-12">
        <SearchForm />
        <div className="max-h-[500px] overflow-y-auto">
          <Suspense fallback={<RouterResultsSkeleton />}>
            <RouterResults />
          </Suspense>
        </div>
      </div>
    </RouteSearchProvider>
  );
};

export default TransitRouter;
