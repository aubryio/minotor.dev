import { VehicleLeg } from 'minotor';
import { formatTime } from '../utils';
import { FC } from 'react';
import RouteTypeIcon from './RouteTypeIcon';

const VehicleLegItem: FC<{ leg: VehicleLeg }> = ({ leg }) => {
  const { from, to, departureTime, arrivalTime, route } = leg;

  return (
    <div className="relative mb-4 flex shadow-lg">
      <div className="flex w-16 flex-col items-center justify-center">
        <span className="flex flex-col items-center text-lg font-bold">
          <RouteTypeIcon routeType={route.type} />
          {route.name}
        </span>
      </div>
      <div className="border-accent flex flex-1 flex-col border-l-4 p-4">
        <div className="mb-4">
          <h3 className="text-md">
            <span className="font-semibold">{formatTime(departureTime)}</span> -{' '}
            {from.name}
          </h3>
          {from.platform && (
            <p className="text-sm text-gray-400">Pl. {from.platform}</p>
          )}
        </div>
        <div>
          <h3 className="text-md">
            <span className="font-semibold">{formatTime(arrivalTime)}</span> -{' '}
            {to.name}
          </h3>
          {to.platform && (
            <p className="text-sm text-gray-400">Pl. {to.platform}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehicleLegItem;
