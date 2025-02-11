import { VehicleLeg } from "minotor";
import { FC } from "react";
import RouteTypeIcon from "./RouteTypeIcon";

const VehicleLegItem: FC<{ leg: VehicleLeg }> = ({ leg }) => {
  const { from, to, departureTime, arrivalTime, route } = leg;

  return (
    <div className="flex shadow-lg mb-4 relative">
      <div className="flex flex-col items-center justify-center w-16">
        <span className="text-lg font-bold flex flex-col items-center">
          <RouteTypeIcon routeType={route.type} />
          {route.name}
        </span>
      </div>
      <div className="flex flex-col flex-1 border-accent p-4 border-l-4">
        <div className="mb-4">
          <h3 className="text-md">
            <span className="font-semibold">{departureTime.toString()}</span> -{" "}
            {from.name}
          </h3>
          {from.platform && (
            <p className="text-sm text-gray-600">Pl. {from.platform}</p>
          )}
        </div>
        <div>
          <h3 className="text-md">
            <span className="font-semibold">{arrivalTime.toString()}</span> -{" "}
            {to.name}
          </h3>
          {to.platform && (
            <p className="text-sm text-gray-600">Platform: {to.platform}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehicleLegItem;
