"use client";
import { FC, useMemo } from "react";
import { useRouter } from "./RouterContext";
import { Query } from "minotor";
import { useRouteSearch } from "./RouteSearchContext";

const RouterResults: FC = () => {
  const router = useRouter();
  const routeSearch = useRouteSearch();
  const result = useMemo(() => {
    return router.route(
      new Query.Builder()
        .from(routeSearch.origin)
        .to(routeSearch.destination)
        .departureTime(routeSearch.departureTime)
        .maxTransfers(4)
        .build(),
    );
  }, [
    routeSearch.departureTime,
    routeSearch.destination,
    routeSearch.origin,
    router,
  ]);
  console.log(routeSearch);
  console.log(result.bestRoute());
  return <>{JSON.stringify(result.bestRoute())}</>;
};

export default RouterResults;
