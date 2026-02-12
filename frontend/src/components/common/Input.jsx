import React from 'react';

const Input = ({ label, error, className = '', ...props }) => {
  const inputClasses = [
    'w-full', 'px-3', 'py-2', 'border', 'rounded-lg',
    'bg-white', 'dark:bg-gray-700',
    'text-gray-900', 'dark:text-white',
    'placeholder-gray-400', 'dark:placeholder-gray-500',
    'focus:outline-none', 'focus:ring-2',
    'focus:ring-indigo-500', 'dark:focus:ring-indigo-400',
    'transition-colors',
    error ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
          {label}
        </label>
      )}
      <input
        className={inputClasses}
        {...props}
      />
      {error && <p className="text-red-500 dark:text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default Input;
