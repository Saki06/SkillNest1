// src/components/Notification.jsx
import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { toast } from 'react-toastify';
import API from '../api/axios';
import { connectWebSocket, disconnectWebSocket } from '../api/websocket';
import { useNavigate } from 'react-router-dom';

const Notification = ({ user }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.id || user?._id) {
      const userId = user.id || user._id;
      fetchNotifications(userId);
      connectWebSocket(userId, (notification) => {
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
        toast.info(notification.message, {
          onClick: () => navigate(`/post/${notification.postId}`),
        });
      });
    }
    return () => disconnectWebSocket();
  }, [user, navigate]);

  const fetchNotifications = async (userId) => {
    try {
      const response = await API.get(`/auth/notifications/unread?userId=${userId}`);
      setNotifications(response.data);
      setUnreadCount(response.data.length);
    } catch (err) {
      toast.error('Failed to load notifications');
      console.error('Fetch notifications error:', err);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await API.post(`/auth/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => prev - 1);
    } catch (err) {
      toast.error('Failed to mark notification as read');
      console.error('Mark as read error:', err);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 rounded-full hover:bg-gray-100 text-gray-600 hover:text-blue-600"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
          </span>
        )}
      </button>
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-96 overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border-b border-gray-100 ${
                  notification.isRead ? 'bg-gray-50' : 'bg-white'
                } cursor-pointer`}
                onClick={() => {
                  markAsRead(notification.id);
                  navigate(`/post/${notification.postId}`);
                  setShowNotifications(false);
                }}
              >
                <p className="text-sm text-gray-800">{notification.message}</p>
                <p className="text-xs text-gray-500">
                  {new Date(notification.createdAt).toLocaleString()}
                </p>
              </div>
            ))
          ) : (
            <p className="p-4 text-sm text-gray-500">No notifications</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Notification;