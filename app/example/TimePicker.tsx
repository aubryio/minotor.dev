"use client";
import { Time } from "minotor";
import { FC, useState } from "react";

const TimePicker: FC<
  {
    value: Time;
    onChange: (newTime: Time) => void;
  } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">
> = ({ value, onChange, ...props }) => {
  const [internalValue, setInternalValue] = useState(
    value.toString().slice(0, 5),
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const timeString = e.target.value;
    try {
      const newTime = Time.fromString(timeString + ":00");
      setInternalValue(timeString);
      onChange(newTime);
    } catch {
      // ignore
    }
  };

  return (
    <input
      type="time"
      id="time"
      className="border rounded-full px-4 py-2 w-max-30 bg-white focus:outline-none focus:bg-[#f6f6f6] text-black"
      value={internalValue}
      onChange={handleChange}
      required
      {...props}
    />
  );
};

export default TimePicker;
