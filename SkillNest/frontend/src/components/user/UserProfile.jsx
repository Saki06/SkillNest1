import React, { useEffect, useState } from 'react';
import API from '../../api/axios';
import { toast } from 'react-toastify';
import { Bookmark, Info } from 'lucide-react';

const UserProfile = ({ username, points }) => {
  const [user, setUser] = useState(null);

  const fetchUser = async () => {
    try {
      const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = savedUser?._id || savedUser?.id;
      const token = localStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      if (!userId) {
        throw new Error('User ID not found in localStorage');
      }

      const res = await API.get(`/auth/users/${userId}`, config);
      setUser(res.data);
    } catch (err) {
      toast.error('Failed to load user profile');
      console.error('Fetch user error:', err);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  if (!user) {
    return (
      <div className="text-center text-gray-500 p-4">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm">
      {/* Cover Image */}
      <div
        className="h-28 bg-cover bg-center relative"
        style={{ backgroundImage: `url(${user.coverImage || '/assets/cover.jpg'})` }}
      ></div>

      {/* Profile Section */}
      <div className="p-4 flex flex-col items-start">
        {/* Avatar */}
        <div className="mb-2">
          <img
            src={user.profileImage || '/assets/avatar.png'}
            alt={`${user.name || 'User'}'s profile`}
            className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
          />
        </div>

        {/* Name */}
        <h2 className="text-xl font-bold">{user.name || username}</h2>

        {/* Headline */}
        <p className="text-gray-600 text-sm mt-1">
          {user.headline || 'No headline available'}
        </p>
        {/* Saved Posts Section */}
        <div className="flex items-center gap-2 mb-3 mt-3">
          <Bookmark className="h-5 w-5 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Saved</span>
          <span className="text-sm text-gray-600">10 posts</span>
        </div>

   
      
      </div>
    </div>
  );
};

export default UserProfile;
