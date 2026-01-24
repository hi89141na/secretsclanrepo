import React from 'react';

const Button = ({ children, variant = 'primary', size = 'md', fullWidth = false, className = '', ...props }) => {
  const baseStyles = 'font-semibold rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    outline: 'border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={[baseStyles, variants[variant], sizes[size], widthClass, className].filter(Boolean).join(' ')}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
