import { LiaTramSolid } from 'react-icons/lia';
import { LiaSubwaySolid } from 'react-icons/lia';
import { LiaTrainSolid } from 'react-icons/lia';
import { LiaBusSolid } from 'react-icons/lia';
import { IoBoatOutline } from 'react-icons/io5';
import { PiCableCar } from 'react-icons/pi';
import { LiaCogSolid } from 'react-icons/lia';
import { LiaBusAltSolid } from 'react-icons/lia';
import { RouteType, RouteTypes } from 'minotor';
import { FC } from 'react';

const RouteTypeIcon: FC<{ routeType: RouteType }> = ({ routeType }) => {
  switch (routeType) {
    case RouteTypes.TRAM:
      return <LiaTramSolid />;
    case RouteTypes.SUBWAY:
      return <LiaSubwaySolid />;
    case RouteTypes.RAIL:
      return <LiaTrainSolid />;
    case RouteTypes.BUS:
      return <LiaBusSolid />;
    case RouteTypes.FERRY:
      return <IoBoatOutline />;
    case RouteTypes.CABLE_TRAM:
      return <PiCableCar />;
    case RouteTypes.AERIAL_LIFT:
      return <PiCableCar />;
    case RouteTypes.FUNICULAR:
      return <LiaCogSolid />;
    case RouteTypes.TROLLEYBUS:
      return <LiaBusAltSolid />;
    case RouteTypes.MONORAIL:
      return <LiaTrainSolid />;
    default:
      return <LiaTrainSolid />;
  }
};

export default RouteTypeIcon;
