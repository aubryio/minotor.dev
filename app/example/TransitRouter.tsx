"use client";
import { FC, Suspense } from "react";
import { RouteSearchProvider } from "./RouteSearchContext";
import SearchForm from "./SearchForm";
import { RouterProvider } from "./RouterContext";
import RouterResults from "./RouterResults";

const TransitRouter: FC = () => {
  return (
    <RouteSearchProvider>
      <SearchForm />
      <Suspense fallback="Loading router...">
        <RouterProvider>
          <RouterResults />
        </RouterProvider>
      </Suspense>
    </RouteSearchProvider>
  );
};

export default TransitRouter;
