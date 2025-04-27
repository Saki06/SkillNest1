import React from 'react';
import { Settings, ChevronDown } from 'lucide-react';

const FeedSettings = () => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-2xl font-bold text-gray-800">Your Feed</h2>
      <div className="flex gap-2">
        <button className="flex items-center gap-1 px-2 py-1 text-gray-600 hover:bg-gray-100 rounded-md">
          <Settings size={18} />
          <span>Home Feed Settings</span>
        </button>
        <button className="flex items-center gap-1 px-2 py-1 text-gray-600 hover:bg-gray-100 rounded-md border border-gray-200">
          <span>All Posts</span>
          <ChevronDown size={18} />
        </button>
      </div>
    </div>
  );
};

export default FeedSettings;
