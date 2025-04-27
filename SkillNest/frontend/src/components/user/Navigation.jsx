import React, { useEffect, useState } from 'react';
import CourseNetworkLogo from '../user/CourseNetworkLogo';
import { Home, Search, BookOpen, Mail, Settings, LogOut } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import API from '../../api/axios';
import { toast } from 'react-toastify';
import Chat from '../chat/Chat';
import Notification from '../Notification';

const Navigation = () => {
  const [initials, setInitials] = useState('SN');
  const [user, setUser] = useState(null);
  const [profileImage, setProfileImage] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Retrieve user from localStorage
        const savedUser = JSON.parse(localStorage.getItem('user') || 'null');
        if (!savedUser) {
          toast.warn('No user found in local storage. Please log in.');
          navigate('/login');
          return;
        }

        // Set initials and profile image
        if (savedUser.name) {
          const names = savedUser.name.trim().split(' ');
          const firstInitial = names[0]?.[0] || '';
          const lastInitial = names.length > 1 ? names[names.length - 1]?.[0] : '';
          setInitials((firstInitial + lastInitial).toUpperCase());
        }
        setProfileImage(savedUser.profileImage || '');
        setUser(savedUser);

        // Validate user ID
        const userId = savedUser._id || savedUser.id;
        if (!userId) {
          toast.error('Invalid user ID');
          return;
        }

        // Get token and set headers
        const token = localStorage.getItem('token');
        if (!token) {
          toast.warn('No authentication token found. Please log in.');
          navigate('/login');
          return;
        }

        const config = { headers: { Authorization: `Bearer ${token}` } };

        // Fetch user data
        const response = await API.get(`/auth/users/${userId}`, config);
        setUser(response.data);
        setProfileImage(response.data.profileImage || '');

        // Fetch unread messages count
        const messagesResponse = await API.get(`/messages/${userId}`, config);
        const unread = messagesResponse.data.filter(msg => !msg.isRead).length;
        setUnreadMessageCount(unread);
      } catch (err) {
        console.error('Error fetching user or messages:', {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data,
        });
        
        if (err.message.includes('Network Error')) {
          toast.error('Network error: Please check your connection and try again.');
        } else if (err.response?.status === 401) {
          toast.warn('Session expired. Please log in again.');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        } else {
          toast.error(`Failed to load data: ${err.response?.data?.message || err.message}`);
        }
      }
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = () => {
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      setUser(null);
      setInitials('SN');
      setProfileImage('');
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (err) {
      console.error('Error during logout:', err);
      toast.error('Failed to log out');
    }
  };

  const getProfileImage = () => {
    if (profileImage) {
      return <img src={profileImage} alt="Profile" className="w-9 h-9 rounded-full object-cover border border-gray-300" />;
    }
    return (
      <div
  className="w-11 h-11 rounded-full bg-gray-200 flex items-center justify-center border-2"
  style={{ borderColor: '#3b82f6' }}
>
  <span className="text-sm font-medium text-black">{initials}</span>
</div>


    );
  };
  return (
    <>
      <nav className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <CourseNetworkLogo />
          <Link
            to="/user"
            className="text-xl font-bold text-gray-800 hover:text-blue-600 transition-colors"
          >
            SkillNest
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/user"
            className={`flex items-center gap-2 px-4 py-2 rounded-md hover:bg-gray-50 ${
              isActive('/user') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
            }`}
          >
            <Home size={20} />
            <span>Home</span>
          </Link>

          <Link
            to="/courses"
            className={`flex items-center gap-2 px-4 py-2 rounded-md hover:bg-gray-50 ${
              isActive('/courses') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
            }`}
          >
            <BookOpen size={20} />
            <span>Courses</span>
          </Link>

          <Link
            to="/search"
            className={`flex items-center gap-2 px-4 py-2 rounded-md hover:bg-gray-50 ${
              isActive('/search') ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
            }`}
          >
            <Search size={20} />
            <span>Search</span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowChat(true)}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-600 hover:text-blue-600 relative"
          >
            <Mail size={20} />
            {unreadMessageCount > 0 && (
              <span className="absolute top-1 right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
            )}
          </button>

          <Notification user={user} />

          <button className="p-2 rounded-full hover:bg-gray-100 text-gray-600 hover:text-blue-600">
            <Settings size={20} />
          </button>

          <button
            onClick={handleLogout}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-600 hover:text-blue-600"
            title="Logout"
          >
            <LogOut size={20} />
          </button>

          <div className="relative ml-2">
            <Link to="/profile">
            {getProfileImage()}
            </Link>
            <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
            </span>
          </div>
        </div>
      </nav>

      {showChat && (
        <Chat
          currentUserId={user?._id || user?.id}
          onClose={() => setShowChat(false)}
        />
      )}
    </>
  );
};

export default Navigation;