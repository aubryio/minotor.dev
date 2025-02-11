import { Transfer } from "minotor";
import { FC } from "react";
import { BsPersonWalking } from "react-icons/bs";
import { MdAirlineSeatReclineNormal } from "react-icons/md";

const TransferLegItem: FC<{ leg: Transfer }> = ({ leg }) => {
  const { minTransferTime, type } = leg;

  return (
    <div className="flex shadow-lg mb-4 relative">
      <div className="flex flex-col items-center justify-center w-16">
        <span className="text-lg font-bold flex flex-col items-center">
          {type === "IN_SEAT" ? (
            <MdAirlineSeatReclineNormal />
          ) : (
            <BsPersonWalking />
          )}
        </span>
      </div>
      <div className="flex flex-col flex-1 border-grey-100 p-4 border-l-4 justify-center">
        <h3 className="text-md">
          {minTransferTime && (
            <span className="font-semibold">{minTransferTime.toString()} </span>
          )}{" "}
          {type === "IN_SEAT" ? "wait in seat" : "walk"}
        </h3>
      </div>
    </div>
  );
};

export default TransferLegItem;
