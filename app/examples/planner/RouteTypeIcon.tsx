import { LiaTramSolid } from 'react-icons/lia';
import { LiaSubwaySolid } from 'react-icons/lia';
import { LiaTrainSolid } from 'react-icons/lia';
import { LiaBusSolid } from 'react-icons/lia';
import { IoBoatOutline } from 'react-icons/io5';
import { PiCableCar } from 'react-icons/pi';
import { LiaCogSolid } from 'react-icons/lia';
import { LiaBusAltSolid } from 'react-icons/lia';
import { RouteType } from 'minotor';
import { FC } from 'react';

const RouteTypeIcon: FC<{ routeType: RouteType }> = ({ routeType }) => {
  switch (routeType) {
    case 'TRAM':
      return <LiaTramSolid />;
    case 'SUBWAY':
      return <LiaSubwaySolid />;
    case 'RAIL':
      return <LiaTrainSolid />;
    case 'BUS':
      return <LiaBusSolid />;
    case 'FERRY':
      return <IoBoatOutline />;
    case 'CABLE_TRAM':
      return <PiCableCar />;
    case 'AERIAL_LIFT':
      return <PiCableCar />;
    case 'FUNICULAR':
      return <LiaCogSolid />;
    case 'TROLLEYBUS':
      return <LiaBusAltSolid />;
    case 'MONORAIL':
      return <LiaTrainSolid />;
    default:
      return <LiaTrainSolid />;
  }
};

export default RouteTypeIcon;
