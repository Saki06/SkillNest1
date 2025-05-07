import React, { useState, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import axios from 'axios';
import { debounce } from 'lodash';
import Navigation from '../components/user/Navigation';

const SearchPage = () => {
  const [activeTab, setActiveTab] = useState('Members');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    country: '',
    institution: '',
    fieldOfStudy: '',
    skills: '',
    internship: ''
  });
  const [results, setResults] = useState([]);
  const [filterOptions, setFilterOptions] = useState({
    countries: [],
    institutions: [],
    fieldsOfStudy: [],
    skills: [],
    internships: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const tabs = ['All CN', 'Members', 'Posts'];

  // Axios instance with default headers
  const axiosInstance = axios.create({
    baseURL: 'http://localhost:8000',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });

  // Fetch filter options
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const response = await axiosInstance.get('/api/search/filters');
        setFilterOptions(response.data);
      } catch (error) {
        console.error('Error fetching filter options:', error.response?.data || error.message);
        setError('Failed to load filter options. Please log in again.');
      }
    };
    fetchFilterOptions();
  }, []);

  // Debounced search
  const handleSearch = useCallback(async () => {
    if (activeTab !== 'Members') return;
    setIsLoading(true);
    setError(null);
    try {
      console.log('Sending request to:', '/api/search/members', { params: { query: searchQuery, ...filters } });
      const response = await axiosInstance.get('/api/search/members', {
        params: { query: searchQuery, ...filters }
      });
      setResults(response.data);
    } catch (error) {
      console.error('Error fetching search results:', error.response?.data || error.message);
      setError(`Failed to fetch search results: ${error.response?.statusText || error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, filters, activeTab]);

  const debouncedSearch = useCallback(debounce(handleSearch, 300), [handleSearch]);

  // Trigger search on query/filter change
  useEffect(() => {
    debouncedSearch();
    return () => debouncedSearch.cancel();
  }, [searchQuery, filters, debouncedSearch]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Search theSN.com</h1>

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

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <input
              type="text"
              placeholder="Search CN Members by full name, first name, or last name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSearch}
              className="bg-blue-600 p-2 rounded-md"
              aria-label="Search"
            >
              <Search className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="flex flex-wrap gap-3">
            <select
              name="country"
              value={filters.country}
              onChange={handleFilterChange}
              className="px-3 py-1 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Country/Region</option>
              {filterOptions.countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
            <select
              name="institution"
              value={filters.institution}
              onChange={handleFilterChange}
              className="px-3 py-1 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Institution</option>
              {filterOptions.institutions.map((institution) => (
                <option key={institution} value={institution}>
                  {institution}
                </option>
              ))}
            </select>
            <select
              name="fieldOfStudy"
              value={filters.fieldOfStudy}
              onChange={handleFilterChange}
              className="px-3 py-1 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Field of Study</option>
              {filterOptions.fieldsOfStudy.map((field) => (
                <option key={field} value={field}>
                  {field}
                </option>
              ))}
            </select>
            <select
              name="skills"
              value={filters.skills}
              onChange={handleFilterChange}
              className="px-3 py-1 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Skills/Competency</option>
              {filterOptions.skills.map((skill) => (
                <option key={skill} value={skill}>
                  {skill}
                </option>
              ))}
            </select>
            <select
              name="internship"
              value={filters.internship}
              onChange={handleFilterChange}
              className="px-3 py-1 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Internship</option>
              {filterOptions.internships.map((internship) => (
                <option key={internship} value={internship}>
                  {internship}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          {error && <p className="text-red-600">{error}</p>}
          {isLoading ? (
            <p className="text-gray-600">Loading...</p>
          ) : activeTab === 'Members' && results.length > 0 ? (
            <ul className="space-y-2">
              {results.map((member) => (
                <li
                  key={member.id}
                  className="p-4 bg-white rounded-lg shadow-sm"
                >
                  <p className="font-medium text-gray-800">{member.fullName}</p>
                  <p className="text-sm text-gray-600">
                    {member.country}, {member.institution}
                  </p>
                  <p className="text-sm text-gray-600">
                    {member.fieldOfStudy} | Skills: {member.skills} | Internship: {member.internship}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">
              {activeTab === 'Members' ? `${results.length} results found` : `No results for ${activeTab}`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;