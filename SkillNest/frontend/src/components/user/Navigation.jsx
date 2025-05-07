import React, { useEffect, useState } from 'react';
import CourseNetworkLogo from '../user/CourseNetworkLogo';
import { Home, Search, BookOpen, Mail, Settings, LogOut } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import API from '../../api/axios';
import { toast } from 'react-toastify';
import Chat from '../chat/Chat';
import Notification from '../Notification';
import { connectWebSocket, disconnectWebSocket } from '../../api/websocket';

const Navigation = () => {
  const [initials, setInitials] = useState('SN');
  const [user, setUser] = useState(null);
  const [profileImage, setProfileImage] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [unreadSenders, setUnreadSenders] = useState(new Set());

  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const savedUser = JSON.parse(localStorage.getItem('user') || 'null');
        if (!savedUser) {
          toast.warn('No user found in local storage. Please log in.');
          navigate('/login');
          return;
        }

        if (savedUser.name) {
          const names = savedUser.name.trim().split(' ');
          const firstInitial = names[0]?.[0] || '';
          const lastInitial = names.length > 1 ? names[names.length - 1]?.[0] : '';
          setInitials((firstInitial + lastInitial).toUpperCase());
        }

        setProfileImage(savedUser.profileImage || '');
        setUser(savedUser);

        const userId = savedUser._id || savedUser.id;
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const response = await API.get(`/auth/users/${userId}`, config);
        setUser(response.data);
        setProfileImage(response.data.profileImage || '');

        // Optional: fetch unread messages and track unique sender IDs
        const messagesResponse = await API.get(`/messages/${userId}`, config);
        const unreadFrom = new Set(
          messagesResponse.data
            .filter(msg => !msg.isRead && msg.receiverId === userId)
            .map(msg => msg.senderId)
        );
        setUnreadSenders(unreadFrom);
      } catch (err) {
        console.error('Error fetching user or messages:', err);
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

  useEffect(() => {
    if (!user?.id && !user?._id) return;
    const userId = user._id || user.id;

    const stomp = connectWebSocket(userId, (msg) => {
      if (msg.receiverId === userId && msg.senderId !== userId) {
        setUnreadSenders((prev) => {
          const updated = new Set(prev);
          updated.add(msg.senderId);
          return updated;
        });

        toast.info(`💬 New message from ${msg.senderName || 'Someone'}`, {
          onClick: () => navigate('/messages'),
          autoClose: 5000,
          pauseOnHover: true,
          closeOnClick: true,
        });

        const sound = new Audio('/sounds/message.mp3');
        sound.play().catch(() => {});

        if (window.navigator.vibrate) {
          window.navigator.vibrate(200);
        }
      }
    });

    return () => disconnectWebSocket();
  }, [user, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setInitials('SN');
    setProfileImage('');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const getProfileImage = () => {
    return profileImage ? (
      <img
        src={profileImage}
        alt="Profile"
        className="w-9 h-9 rounded-full object-cover border border-gray-300"
      />
    ) : (
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
            onClick={() => {
              setShowChat(true);
              setUnreadSenders(new Set()); // Clear unread senders
            }}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-600 hover:text-blue-600 relative"
          >
            <Mail size={20} />
            {unreadSenders.size > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow">
                {unreadSenders.size > 99 ? '99+' : unreadSenders.size}
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
            <Link to="/profile">{getProfileImage()}</Link>
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
