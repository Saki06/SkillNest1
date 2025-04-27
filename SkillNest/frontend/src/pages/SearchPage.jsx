import React, { useState } from 'react';
import { Home, BookOpen, Search, Bell, Mail, Settings, User } from 'lucide-react';
import Navigation from '../components/user/Navigation';

const SearchPage = () => {
  const [activeTab, setActiveTab] = useState('Members');

  const tabs = ['All CN', 'Members', 'Posts'];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Bar */}
      <Navigation />


      {/* Search Section */}
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Search theSN.com</h1>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-gray-300 mb-4">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 text-sm font-medium ${
                activeTab === tab
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search Input and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <input
              type="text"
              placeholder="Search CN Members by full name, first name, last name or CN#"
              className="w-full px-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="bg-blue-600 p-2 rounded-md" aria-label="Search">
              <Search className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap gap-3">
            <select className="px-3 py-1 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Country/Region</option>
              {/* Add options dynamically based on data */}
            </select>
            <select className="px-3 py-1 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Institution</option>
            </select>
            <select className="px-3 py-1 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Field of Study</option>
            </select>
            <select className="px-3 py-1 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Skills/Competency</option>
            </select>
            <select className="px-3 py-1 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Internship</option>
            </select>
          </div>
        </div>

        {/* Search Results */}
        <div className="mt-4">
          <p className="text-gray-600">0 results found</p>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;