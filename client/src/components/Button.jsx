// client/src/components/Button.jsx
import React from 'react';

const Button = ({ children, type = 'submit', fullWidth = true }) => {
  return (
    <button
      type={type}
      className={`group relative ${
        fullWidth ? 'w-full' : ''
      } flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500`}
    >
      {children}
    </button>
  );
};

export default Button;
