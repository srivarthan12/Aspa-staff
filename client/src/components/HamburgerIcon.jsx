// client/src/components/HamburgerIcon.jsx
import React from 'react';

const HamburgerIcon = ({ onClick }) => {
  return (
    <button onClick={onClick} className="p-2 rounded-md text-gray-500 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500">
      <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  );
};

export default HamburgerIcon;