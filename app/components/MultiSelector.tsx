import cn from 'classnames';
import React, { useEffect, useRef, useState } from 'react';

export type Option = {
  label: string;
  value: string | number;
};

export type MultiSelectorProps = {
  options: Option[];
  value: (string | number)[];
  disabledMultiSelect?: boolean;
  onChange?: (value: (string | number)[]) => void;
};

export const MultiSelector = ({
  options = [],
  value = [],
  disabledMultiSelect = false,
  onChange,
}: MultiSelectorProps) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const onClickItem = (itemValue: string | number) => {
    if (!onChange) {
      return;
    }

    if (value.includes(itemValue)) {
      onChange(value.filter((v) => v !== itemValue));
    } else {
      if (!disabledMultiSelect) {
        onChange([...value, itemValue]);
      } else {
        onChange([itemValue]);
      }
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (ref.current && !ref.current.contains(event.target as Node)) {
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <div className="w-full flex-col">
      <div
        ref={ref}
        className="w-full flex flex-row h-[42px] border-[1px] border-solid border-gray rounded-md bg-white items-center cursor-pointer"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <div className="flex-1 line-clamp-1 px-3">{value.join(', ')}</div>
        <div className="w-[42px] h-full flex flex-row items-center justify-center">
          {showDropdown ? (
            <svg width="16" height="10" viewBox="0 0 16 10" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 8.30467C12.2663 5.84254 10.7337 4.46212 8 2L1 8.30467" stroke="black" stroke-width="2" />
            </svg>
          ) : (
            <svg width="16" height="10" viewBox="0 0 16 10" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 1.69533C12.2663 4.15746 10.7337 5.53788 8 8L1 1.69533" stroke="black" stroke-width="2" />
            </svg>
          )}
        </div>
      </div>

      {showDropdown && (
        <div className="w-full min-h-[40px] bg-white px-1 py-1 mt-1 select-none rounded-md shadow-lg shadow-black/25">
          {options.map((option) => (
            <div
              className={cn(
                'w-full h-[40px] rounded-sm my-1 px-3 flex flex-row items-center hover:bg-[#1aa181] hover:text-white cursor-pointer',
                {
                  'bg-[#1aa181] text-white': value.includes(option.value),
                },
              )}
              key={option.value}
              onClick={() => onClickItem(option.value)}
            >
              <div>{option.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
