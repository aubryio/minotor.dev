import { Transfer } from 'minotor';
import { FC } from 'react';
import { BsPersonWalking } from 'react-icons/bs';
import { MdAirlineSeatReclineNormal } from 'react-icons/md';

const TransferLegItem: FC<{ leg: Transfer }> = ({ leg }) => {
  const { minTransferTime, type } = leg;

  return (
    <div className="relative mb-4 flex shadow-lg">
      <div className="flex w-16 flex-col items-center justify-center">
        <span className="flex flex-col items-center text-lg font-bold">
          {type === 'IN_SEAT' ? (
            <MdAirlineSeatReclineNormal />
          ) : (
            <BsPersonWalking />
          )}
        </span>
      </div>
      <div className="border-grey-100 flex flex-1 flex-col justify-center border-l-4 p-4">
        <h3 className="text-md">
          {minTransferTime && (
            <span className="font-semibold">{minTransferTime.toString()} </span>
          )}{' '}
          {type === 'IN_SEAT' ? 'wait in seat' : 'walk'}
        </h3>
      </div>
    </div>
  );
};

export default TransferLegItem;
