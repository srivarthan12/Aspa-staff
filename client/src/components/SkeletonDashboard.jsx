// client/src/components/SkeletonDashboard.jsx
import React from 'react';

const SkeletonDashboard = () => {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="h-28 bg-gray-300 rounded-lg"></div>
        <div className="h-28 bg-gray-300 rounded-lg"></div>
        <div className="h-28 bg-gray-300 rounded-lg"></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 h-80 bg-gray-300 rounded-lg"></div>
        <div className="lg:col-span-2 h-80 bg-gray-300 rounded-lg"></div>
      </div>
    </div>
  );
};

export default SkeletonDashboard;