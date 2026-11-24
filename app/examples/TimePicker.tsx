'use client';
import { FC } from 'react';

const TimePicker: FC<
  {
    value: Date;
    onChange: (newTime: Date) => void;
  } & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'>
> = ({ value, onChange, ...props }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const timeString = e.target.value;
    try {
      const [hours, minutes] = timeString.split(':').map(Number);
      if (
        !isNaN(hours) &&
        !isNaN(minutes) &&
        hours >= 0 &&
        hours < 24 &&
        minutes >= 0 &&
        minutes < 60
      ) {
        const newTime = new Date(value);
        newTime.setHours(hours, minutes, 0, 0);
        onChange(newTime);
      }
    } catch {
      // ignore
    }
  };

  return (
    <input
      type="time"
      className="w-max-30 rounded-full border bg-white px-4 py-2 text-black focus:bg-[#f6f6f6]"
      value={`${String(value.getHours()).padStart(2, '0')}:${String(value.getMinutes()).padStart(2, '0')}`}
      onChange={handleChange}
      required
      {...props}
    />
  );
};

export default TimePicker;
