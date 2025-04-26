import React from 'react';
import { Search, ExternalLink, MoreHorizontal } from 'lucide-react';

const CourseMenu = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-blue-100 rounded-md flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600">
              <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
              <polyline points="7.5 4.21 12 6.81 16.5 4.21" />
              <polyline points="7.5 19.79 7.5 14.6 3 12" />
              <polyline points="21 12 16.5 14.6 16.5 19.79" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          </div>
          <h3 className="font-bold text-gray-800">Your Courses/Networks</h3>
        </div>
        <button>
          <MoreHorizontal size={20} className="text-gray-500" />
        </button>
      </div>

      <div className="relative mb-4">
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <Search size={18} />
        </span>
        <input 
          type="text" 
          placeholder="Search courses"
          className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
        />
      </div>

      <button className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-full hover:bg-blue-700">
        <ExternalLink size={18} />
        <span>Explore course/network</span>
      </button>
    </div>
  );
};

export default CourseMenu;
