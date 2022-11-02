import { useState } from 'react';

const Switch = ({ checked, onChange, label, disabled }) => {
  return (
    <div
      className={`flex flex-row items-center gap-2 ${
        disabled ? '' : 'cursor-pointer'
      }`}
      onClick={() => !disabled && onChange(!checked)}
    >
      <div
        className={`flex w-14 items-center rounded-full p-1 transition-all duration-300 ease-in-out ${
          checked ? 'ml-auto mr-0 bg-primary' : 'mr-auto ml-0 bg-slate-300'
        } ${
          disabled ? 'opacity-40' : 'cursor-pointer'
        } shadow-[inset_1px_1px_3px_0px_rgba(0,0,0,0.1)]`}
      >
        <div
          className={`flex h-4 w-4 rounded-full bg-white p-1 shadow-sm transition-all duration-500 ease-in-out ${
            checked ? 'translate-x-8' : ''
          }`}
        />
      </div>
      {label}
    </div>
  );
};

export default Switch;
