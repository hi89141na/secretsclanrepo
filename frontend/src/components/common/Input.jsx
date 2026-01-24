import React from 'react';

const Input = ({ label, error, className = '', ...props }) => {
  const inputClasses = ['w-full', 'px-3', 'py-2', 'border', 'rounded-lg', 'focus:outline-none', 'focus:ring-2', 'focus:ring-indigo-500', error ? 'border-red-500' : 'border-gray-300', className].filter(Boolean).join(' ');

  return (
    <div className='mb-4'>
      {label && (
        <label className='block text-gray-700 text-sm font-bold mb-2'>
          {label}
        </label>
      )}
      <input
        className={inputClasses}
        {...props}
      />
      {error && <p className='text-red-500 text-xs mt-1'>{error}</p>}
    </div>
  );
};

export default Input;
