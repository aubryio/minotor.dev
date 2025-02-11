"use client";
import { FC, useState } from "react";

const TimePicker: FC<
  {
    value: Date;
    onChange: (newTime: Date) => void;
  } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">
> = ({ value, onChange, ...props }) => {
  const [internalValue, setInternalValue] = useState(
    value.toLocaleTimeString("en-CH", { hour: "2-digit", minute: "2-digit" }),
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const timeString = e.target.value;
    try {
      const [hours, minutes] = timeString.split(":").map(Number);
      if (
        !isNaN(hours) &&
        !isNaN(minutes) &&
        hours >= 0 &&
        hours < 24 &&
        minutes >= 0 &&
        minutes < 60
      ) {
        const newTime = new Date(value);
        newTime.setHours(hours, minutes);
        setInternalValue(timeString);
        onChange(newTime);
      }
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
