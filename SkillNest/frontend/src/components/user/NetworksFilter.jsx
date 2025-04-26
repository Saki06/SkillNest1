import React from 'react';
import { Plus, Edit } from 'lucide-react';

const NetworksFilter = () => {
  const networks = [
    { name: "AL", count: 2 },
    { name: "DE&I", count: 8 },
    { name: "DataAccess", count: 6 },
    { name: "Developer", count: 182 },
    { name: "Front-EndWebDevelopment", count: 69 },
    { name: "ML", count: 9 }
  ];

  return (
    <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" className="text-yellow-700">
              <path d="M4 4h4v4H4zM4 12h4v4H4zM12 4h4v4h-4zM12 12h4v4h-4z" fill="currentColor" />
              <path d="M12 20h4v4h-4zM4 20h4v4H4zM20 4h4v4h-4zM20 12h4v4h-4z" fill="currentColor" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-800">Networks and Communities</h2>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1 bg-blue-600 text-white px-4 py-1 rounded-md hover:bg-blue-700">
            <Plus size={18} />
            <span>Join Communities</span>
          </button>
          <button className="p-1 text-gray-500 hover:bg-gray-100 rounded">
            <Edit size={18} />
          </button>
        </div>
      </div>
      <div>
        <p className="text-gray-600 mb-3">Select tags below to filter posts:</p>
        <div className="flex flex-wrap gap-2">
          {networks.map((network, index) => (
            <button 
              key={index} 
              className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full text-sm"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" className="text-gray-500">
                <path d="M12 2a10 10 0 1010 10A10 10 0 0012 2zm0 18a8 8 0 118-8 8 8 0 01-8 8z" fill="currentColor" />
                <path d="M12 8a2 2 0 102 2 2 2 0 00-2-2zm0 10a2 2 0 102-2 2 2 0 00-2 2z" fill="currentColor" />
              </svg>
              <span>{network.name}</span>
              <span className="text-gray-500">({network.count})</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NetworksFilter;
