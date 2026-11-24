import { Leg, VehicleLeg, TransferTypes } from 'minotor';
import { FC } from 'react';
import { BsPersonWalking } from 'react-icons/bs';
import { MdAirlineSeatReclineNormal } from 'react-icons/md';
import { humanizeDuration } from '../utils';

const TransferLegItem: FC<{ leg: Exclude<Leg, VehicleLeg> }> = ({ leg }) => {
  const minTransferTime = 'type' in leg ? leg.minTransferTime : leg.duration;
  const inSeat = 'type' in leg && leg.type === TransferTypes.IN_SEAT;

  return (
    <div className="relative mb-4 flex shadow-lg">
      <div className="flex w-16 flex-col items-center justify-center">
        <span className="flex flex-col items-center text-lg font-bold">
          {inSeat ? <MdAirlineSeatReclineNormal /> : <BsPersonWalking />}
        </span>
      </div>
      <div className="border-grey-100 flex flex-1 flex-col justify-center border-l-4 p-4">
        <h3 className="text-md">
          {minTransferTime && (
            <span className="font-semibold">
              {humanizeDuration(minTransferTime * 60)}
            </span>
          )}{' '}
          {inSeat ? 'wait in seat' : 'walk'}
        </h3>
      </div>
    </div>
  );
};

export default TransferLegItem;
