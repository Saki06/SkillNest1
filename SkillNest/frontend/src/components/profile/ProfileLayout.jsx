import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../../api/axios';
import Navigation from '../user/Navigation';
import defaultProfile from '../../assets/profilepicture.jpg';
import { Upload,Trash2 } from 'lucide-react';
import AboutSection from '../profile/AboutSection';
import SkillsSection from '../profile/SkillsSection';
import ShowcasesesSection from '../profile/ShowcasesSection';
import DocumentsSection from '../profile/DocumentsSection';
import Recommendation from '../profile/RecommendationsSection';
import PostSection from '../profile/PostsSection';



const ProfileLayout = () => {
  // State management
  const [user, setUser] = useState(null);
  const [isLoading, setIs_loading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [editName, setEditName] = useState('');
  const [editHeadline, setEditHeadline] = useState('');
  const [counts, setCounts] = useState({ followers: 0, following: 0 });

  // Hooks
  const location = useLocation();
  const navigate = useNavigate();

  // Data fetching
  const fetchUser = async () => {
    try {
      setIs_loading(true);
      setError(null);
      const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = savedUser?._id || savedUser?.id;

      if (!userId) throw new Error('Please log in to view your profile');

      const token = localStorage.getItem('token');
      const config = token ? {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000
      } : {};

      const res = await API.get(`/auth/users/${userId}`, config);
      if (!res.data) throw new Error('No user data returned');

      setUser(res.data);
      setEditName(res.data.name || '');
      setEditHeadline(res.data.headline || '');
      localStorage.setItem('user', JSON.stringify(res.data));

      const countRes = await API.get(`/auth/users/${userId}/counts`, config);
      setCounts({
        followers: countRes.data.followersCount || 0,
        following: countRes.data.followingCount || 0,
      });
    } catch (err) {
      console.error('Failed to fetch user:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load profile');
      toast.error(err.response?.data?.message || err.message || 'Failed to load profile');
      if (err.response?.status === 401) navigate('/login');
    } finally {
      setIs_loading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // Handlers
  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match('image.*')) {
      toast.error('Please upload an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size should be less than 5MB');
      return;
    }

    try {
      setIs_loading(true);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Please log in');

      const userId = user._id || user.id;
      const formData = new FormData();
      formData.append('coverImage', file);

      const res = await API.post(`/auth/users/${userId}/cover`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`, 
          'Content-Type': 'multipart/form-data' 
        },
      });

      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
      toast.success('Cover image uploaded successfully');
    } catch (err) {
      console.error('Upload failed:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to upload cover image');
    } finally {
      setIs_loading(false);
    }
  };

  const handleProfileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match('image.*')) {
      toast.error('Please upload an image file');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Profile image should be less than 2MB');
      return;
    }

    try {
      setIs_loading(true);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Please log in');

      const userId = user._id || user.id;
      const formData = new FormData();
      formData.append('profileImage', file);

      const res = await API.post(`/auth/users/${userId}/profile`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`, 
          'Content-Type': 'multipart/form-data' 
        },
      });

      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
      toast.success('Profile image uploaded successfully');
    } catch (err) {
      console.error('Profile upload failed:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to upload profile image');
    } finally {
      setIs_loading(false);
    }
  };

  const handleDeleteCover = async () => {
    try {
      setIs_loading(true);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Please log in');

      const userId = user._id || user.id;
      const res = await API.delete(`/auth/users/${userId}/cover`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
      toast.success('Cover image removed successfully');
    } catch (err) {
      console.error('Delete cover failed:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to remove cover image');
    } finally {
      setIs_loading(false);
    }
  };

  const handleDeleteProfile = async () => {
    try {
      setIs_loading(true);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Please log in');

      const userId = user._id || user.id;
      const res = await API.delete(`/auth/users/${userId}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
      toast.success('Profile image removed successfully');
    } catch (err) {
      console.error('Delete profile failed:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to remove profile image');
    } finally {
      setIs_loading(false);
    }
  };

  const handleSaveHeader = async () => {
    if (!editName.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    try {
      setIs_loading(true);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Please log in');

      const userId = user._id || user.id;
      const payload = {
        name: editName.trim(),
        headline: editHeadline.trim(),
      };

      const mergedPayload = { ...user, ...payload };

      const res = await API.put(`/auth/users/${userId}`, mergedPayload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
      setIsEditingHeader(false);
      toast.success('Profile updated successfully');
    } catch (err) {
      console.error('Failed to update header:', err);
      toast.error(err.response?.data?.message || err.message || 'Failed to update profile');
    } finally {
      setIs_loading(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-t-4 border-blue-600"></div>
          <p className="mt-4 text-lg text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-lg text-red-600">{error}</p>
          <button
            onClick={fetchUser}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700 disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Retrying...' : 'Retry'}
          </button>
        </div>
      </div>
    );
  }

  // No user state
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-lg text-gray-600">No profile data available.</p>
          <button
            onClick={fetchUser}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Sidebar Navigation */}
          <aside className="w-full rounded-xl bg-white p-6 shadow-lg lg:w-64 lg:sticky lg:top-24">
            <h2 className="mb-4 text-lg font-semibold text-blue-700">SkillNest Menu</h2>
            <ul className="space-y-2 text-sm text-gray-600">
              {['about', 'skills', 'documents', 'showcases', 'recommendations', 'posts'].map((section) => (
                <li key={section}>
                  <Link
                    to={`/profile/${section}`}
                    className={`block rounded-lg p-3 transition ${
                      location.pathname === `/profile/${section}`
                        ? 'bg-blue-50 font-semibold text-blue-700'
                        : 'hover:bg-gray-100 hover:text-blue-700'
                    }`}
                  >
                    {section.charAt(0).toUpperCase() + section.slice(1).replace(/([A-Z])/g, ' $1')}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 space-y-7">
            {/* Profile Header Section */}
            <section className="rounded-xl bg-white shadow-lg">
              {/* Cover Image */}
              <div
                className="relative h-48 bg-cover bg-center"
                style={{ backgroundImage: `url(${user.coverImage || '/assets/cover.jpg'})` }}
              >
                <input
                  type="file"
                  id="coverUpload"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverUpload}
                  disabled={isLoading}
                />
                <div className="absolute right-4 top-4 flex gap-2">
  <button
    onClick={() => document.getElementById('coverUpload').click()}
    className="p-2 rounded-full bg-white hover:bg-gray-100 text-gray-600 shadow disabled:opacity-50"
    title="Upload Cover"
    disabled={isLoading}
  >
    <Upload size={18} />
  </button>

  {user.coverImage && (
    <button
      onClick={handleDeleteCover}
      className="p-2 rounded-full bg-white hover:bg-red-50 text-red-600 shadow disabled:opacity-50"
      title="Remove Cover"
      disabled={isLoading}
    >
      <Trash2 size={18} />
    </button>
  )}
</div>
              </div>

              {/* Profile Details */}
              <div className="p-6">
                <div className="relative -mt-16">
                  <div className="flex items-end gap-4">
                    <div className="relative">
                      <img
                        src={user.profileImage?.trim() ? user.profileImage : defaultProfile}
                        alt={`${user.name}'s profile`}
                        className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-md"
                      />
                      <input
                        type="file"
                        id="profileUpload"
                        accept="image/*"
                        className="hidden"
                        onChange={handleProfileUpload}
                        disabled={isLoading}
                      />
                      <div className="absolute bottom-0 right-0 flex gap-1">
                        <button
                          onClick={() => document.getElementById('profileUpload').click()}
                          className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-blue-600 text-white transition hover:bg-blue-700 disabled:opacity-50"
                          disabled={isLoading}
                          aria-label="Upload profile image"
                        >
                          +
                        </button>
                        {user.profileImage && (
                          <button
                            onClick={handleDeleteProfile}
                            className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-red-600 text-white transition hover:bg-red-700 disabled:opacity-50"
                            disabled={isLoading}
                            aria-label="Remove profile image"
                          >
                            <Trash2 size={10} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  {isEditingHeader ? (
                    <div className="space-y-3">
                      <div>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Full Name"
                          className={`w-full rounded-lg border-2 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${
                            !editName.trim() ? 'border-red-500 bg-red-50' : 'border-blue-300'
                          }`}
                          maxLength={100}
                          disabled={isLoading}
                        />
                        {!editName.trim() && (
                          <div className="relative h-0">
                            <div className="absolute left-0 top-[-2px] h-1 w-full bg-red-500 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjQiPjxwYXRoIGQ9Ik0wIDJDNCAwIDYgNCAxMCAyYzQtMiA2IDQgMTAgMmM0LTIgNiA0IDEwIDJzNi00IDEwIDJjNC0yIDYgNCAxMCAycy02IDQtMTAgMmMtNC0yLTYgNC0xMCAyYy00IDIgLTYgNC0xMCAyYy00LTIgLTYgNC0xMCAyYy00IDIgLTYgNC0xMCAyYy00LTIgLTYgNC0xMCAyIiBzdHJva2U9InJlZCIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+')] bg-no-repeat"></div>
                          </div>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          value={editHeadline}
                          onChange={(e) => setEditHeadline(e.target.value)}
                          placeholder="Headline"
                          className="w-full rounded-lg border-2 border-blue-300 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                          maxLength={200}
                          disabled={isLoading}
                        />
                        <button
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          onClick={() => setEditHeadline('')}
                          aria-label="Clear headline"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => setIsEditingHeader(false)}
                          className="rounded-full border-2 border-blue-500 px-4 py-1.5 text-sm font-medium text-blue-500 transition hover:bg-blue-50 disabled:opacity-50"
                          disabled={isLoading}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveHeader}
                          className="rounded-full bg-blue-500 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-blue-600 disabled:opacity-50"
                          disabled={isLoading}
                        >
                          {isLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                        <span className="text-lg">🇱🇰</span>
                        <button
                          onClick={() => {
                            setIsEditingHeader(true);
                            setEditName(user.name || '');
                            setEditHeadline(user.headline || '');
                          }}
                          className="text-sm font-medium text-blue-600 transition hover:underline"
                          aria-label="Edit profile"
                        >
                          Edit
                        </button>
                      </div>
                      <p className="mt-1 text-sm text-gray-500 italic">
                        {user.headline || 'Add a headline to describe yourself.'}
                      </p>
                    </div>
                  )}

                  <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
                    <a href={`mailto:${user.email}`} className="hover:text-blue-600 hover:underline">
                      {user.email}
                    </a>
                    <span>
                      📅 Joined{' '}
                      {new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                    <span>⏱ Last Visit: Just now</span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-4 text-sm font-medium text-blue-600">
                    <button className="hover:underline">Show Public View</button>
                    <button className="hover:underline">Privacy Settings</button>
                    <button className="hover:underline">+ Link to Websites</button>
                  </div>

                  <div className="mt-4 flex gap-6 text-sm">
                    <div className="text-center">
                      <p className="font-semibold text-gray-900">{counts.following}</p>
                      <p className="text-gray-500">Following</p>
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-gray-900">{counts.followers}</p>
                      <p className="text-gray-500">Followers</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Dynamic Content Section */}
            <Outlet context={{ user, fetchUser }} />
            
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProfileLayout;