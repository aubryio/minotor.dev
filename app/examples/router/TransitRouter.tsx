'use client';
import { FC } from 'react';
import { RouteSearchProvider } from './RouteSearchContext';
import SearchForm from './SearchForm';
import RouterResults from './RouterResults';

const TransitRouter: FC = () => {
  return (
    <RouteSearchProvider>
      <div className="flex flex-col items-center space-y-12">
        <SearchForm />
        <div className="max-h-[720px] overflow-y-auto">
          <RouterResults />
        </div>
      </div>
    </RouteSearchProvider>
  );
};

export default TransitRouter;
