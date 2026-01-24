import React from 'react';

const Loader = ({ size = 'md', fullScreen = false }) => {
  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  const loaderClasses = ['animate-spin', 'rounded-full', 'border-4', 'border-gray-300', 'border-t-indigo-600', sizes[size]].filter(Boolean).join(' ');

  const loader = (
    <div className={loaderClasses} />
  );

  if (fullScreen) {
    return (
      <div className='fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50'>
        {loader}
      </div>
    );
  }

  return <div className='flex justify-center items-center p-8'>{loader}</div>;
};

export default Loader;
