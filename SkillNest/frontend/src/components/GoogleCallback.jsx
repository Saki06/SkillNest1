import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleCallback = () => {
      try {
        // Extract query parameters
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const user = params.get('user');
        const error = params.get('error');

        if (error) {
          throw new Error(decodeURIComponent(error));
        }

        if (!token || !user) {
          throw new Error('Missing token or user data');
        }

        // Parse the user data (it's URL-encoded JSON)
        const userData = JSON.parse(decodeURIComponent(user));

        // Save token and user to localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));

        toast.success('Google login successful');
        navigate('/profile');
      } catch (err) {
        console.error('Google callback error:', err);
        toast.error(err.message || 'Google login failed');
        navigate('/login');
      }
    };

    handleCallback();
  }, [navigate, location]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-600">Processing Google login...</p>
    </div>
  );
};

export default GoogleCallback;