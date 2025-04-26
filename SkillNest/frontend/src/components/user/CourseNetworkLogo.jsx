import React from 'react';

const CourseNetworkLogo = ({ size = 40 }) => {
  return (
    <div className="flex items-center">
      <div
        className="bg-blue-700 text-white rounded-full flex items-center justify-center font-bold"
        style={{ width: size, height: size }}
      >
        <span className="text-lg">SN</span>
      </div>
    </div>
  );
};

export default CourseNetworkLogo;
