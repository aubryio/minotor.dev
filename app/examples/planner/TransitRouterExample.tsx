'use client';
import { FC } from 'react';
import { RouteSearchProvider } from './RouteSearchContext';
import SearchForm from './SearchForm';
import RouterResults from './RouterResults';

const TransitRouterExample: FC = () => {
  return (
    <RouteSearchProvider>
      <div className="flex flex-col items-center space-y-12 text-left">
        <SearchForm />
        <div>
          <RouterResults />
        </div>
      </div>
    </RouteSearchProvider>
  );
};

export default TransitRouterExample;
