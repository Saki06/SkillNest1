import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../../api/axios';
import { motion } from 'framer-motion';

const PostsPage = () => {
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState({});
  const [showAllPosts, setShowAllPosts] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentPost, setCurrentPost] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    content: '',
    visibility: 'public',
    addToPortfolio: false,
    files: [],
    existingMedia: [],
    removedMedia: [],
  });
  const [error, setError] = useState(null);

  // Base URL for media
  const BASE_URL = 'http://localhost:8000';

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData?.id || userData?._id) {
      const id = userData.id || userData._id;
      setUser(userData);
      fetchPosts(id);
    } else {
      setError('User not found. Please log in.');
    }
  }, []);

  const fetchPosts = async (uid) => {
    try {
      const res = await API.get(`/auth/posts/user?userId=${uid}`);
      setPosts(res.data);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      setError('Failed to load posts. Please try again later.');
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await API.delete(`/auth/posts/${postId}`);
      setPosts((prev) => prev.filter((post) => post.id !== postId));
    } catch (error) {
      console.error('Failed to delete post:', error);
      setError('Failed to delete post. Please try again.');
    }
  };

  const handleEdit = (post) => {
    setCurrentPost(post);
    setEditForm({
      title: post.title,
      content: post.content,
      visibility: post.visibility,
      addToPortfolio: post.addToPortfolio,
      files: [],
      existingMedia: post.mediaUrls || [],
      removedMedia: [],
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!currentPost) return;

    const formData = new FormData();
    formData.append('title', editForm.title);
    formData.append('content', editForm.content);
    formData.append('visibility', editForm.visibility);
    formData.append('addToPortfolio', editForm.addToPortfolio);
    formData.append('userId', user.id || user._id);

    // Append removedMedia if there are any
    if (editForm.removedMedia.length > 0) {
      formData.append('removedMedia', JSON.stringify(editForm.removedMedia));
    }

    // Append new files
    editForm.files.forEach((file) => {
      formData.append('files', file);
    });

    try {
      const res = await API.put(`/auth/posts/${currentPost.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      setPosts((prev) =>
        prev.map((post) => (post.id === currentPost.id ? res.data : post))
      );
      setIsEditModalOpen(false);
      setCurrentPost(null);
      setEditForm({ 
        title: '', 
        content: '', 
        visibility: 'public', 
        addToPortfolio: false, 
        files: [], 
        existingMedia: [], 
        removedMedia: [] 
      });
    } catch (error) {
      console.error('Failed to update post:', error);
      setError('Failed to update post. Please try again.');
    }
  };

  const handleFileChange = (e) => {
    setEditForm((prev) => ({
      ...prev,
      files: [...prev.files, ...Array.from(e.target.files)]
    }));
  };

  const handleRemoveMedia = (mediaUrl, isExisting) => {
    if (isExisting && !window.confirm('Are you sure you want to remove this media file? This action cannot be undone.')) {
      return;
    }
    if (isExisting) {
      setEditForm((prev) => ({
        ...prev,
        existingMedia: prev.existingMedia.filter((url) => url !== mediaUrl),
        removedMedia: [...prev.removedMedia, mediaUrl],
      }));
    } else {
      // Remove newly added file that hasn't been uploaded yet
      setEditForm((prev) => ({
        ...prev,
        files: prev.files.filter((file) => file.name !== mediaUrl),
      }));
    }
  };

  const getFileExtension = (filename) => {
    if (!filename) return '';
    const name = typeof filename === 'string' ? filename : filename.name;
    return name.split('.').pop()?.toLowerCase() || '';
  };

  const getMediaUrl = (media) => {
    if (typeof media === 'string') {
      return media.startsWith('http') ? media : `${BASE_URL}${media}`;
    }
    return URL.createObjectURL(media);
  };

  const renderMedia = (media, idx, isEditable = false) => {
    const url = getMediaUrl(media);
    const ext = getFileExtension(media);

    const cardVariants = {
      rest: { scale: 1, boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' },
      hover: {
        scale: 1.03,
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)',
        transition: { duration: 0.3, ease: 'easeOut' },
      },
    };

    return (
      <motion.div
        key={idx}
        className="w-full rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-lg relative"
        style={{ aspectRatio: '4 / 3' }}
        variants={cardVariants}
        initial="rest"
        whileHover="hover"
      >
        {ext === 'pdf' ? (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="relative flex flex-col items-center justify-center h-full p-6 text-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 transition-colors"
            aria-label="View PDF document in a new tab"
          >
            <div className="absolute inset-0 bg-white/30 dark:bg-gray-900/30 backdrop-blur-sm rounded-xl" />
            <div className="relative z-10 mb-4">
              <svg
                className="w-12 h-12 text-gradient-to-r from-red-500 to-pink-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <span className="relative z-10 text-lg font-semibold text-gray-800 dark:text-gray-100">
              PDF Document
            </span>
            <span className="relative z-10 mt-2 text-sm font-medium text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
              Open File
            </span>
            <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-200 to-blue-300 dark:from-blue-600 dark:to-blue-700" />
          </a>
        ) : ['jpg', 'jpeg', 'png', 'gif'].includes(ext) ? (
          <img
            src={url}
            alt={`Post media ${idx + 1}`}
            className="w-full h-full object-cover object-center"
            onError={(e) => (e.target.src = '/assets/fallback-image.png')}
          />
        ) : ['mp4', 'webm', 'mov'].includes(ext) ? (
          <div className="relative flex flex-col items-center justify-center h-full p-4 text-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 transition-colors">
            <div className="absolute inset-0 bg-white/30 dark:bg-gray-900/30 backdrop-blur-sm rounded-xl" />
            <div className="relative z-10 w-full h-3/4">
              <video
                src={url}
                controls
                preload="metadata"
                className="w-full h-full object-cover object-center rounded-lg"
                aria-label="Play video content"
              />
            </div>
            <span className="relative z-10 mt-2 text-sm font-medium text-gray-800 dark:text-gray-100">
              Video Content
            </span>
            <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-200 to-purple-300 dark:from-purple-600 dark:to-purple-700" />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full p-6 bg-gray-50 dark:bg-gray-700">
            <span className="text-sm text-gray-500 dark:text-gray-400">Unsupported file</span>
          </div>
        )}

        {isEditable && (
          <button
            type="button"
            onClick={() => handleRemoveMedia(media, typeof media === 'string')}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
            aria-label="Remove media"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </motion.div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 max-w-6xl mx-auto">
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">MY SN POSTS</h1>
        <p className="text-sm text-gray-600">
          These are posts that you have added to your public SN SkillNest.{' '}
          <a href="#" className="text-blue-500 hover:text-blue-700 font-medium">Learn more</a>
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="border p-6 rounded-lg text-center text-gray-400 text-sm bg-gray-50 mb-6">
          You haven't added any posts to your public SkillNest profile.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(showAllPosts ? posts : posts.slice(0, 2)).map((post) => (
              <PostCard
                key={post.id}
                post={post}
                user={user}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
                renderMedia={renderMedia}
              />
            ))}
          </div>
          {posts.length > 2 && !showAllPosts && (
            <button
              onClick={() => setShowAllPosts(true)}
              className="w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg text-sm font-medium transition-colors"
            >
              Show all posts ({posts.length - 2} more)
            </button>
          )}
          {posts.length > 2 && showAllPosts && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {posts.slice(2).map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  user={user}
                  handleEdit={handleEdit}
                  handleDelete={handleDelete}
                  renderMedia={renderMedia}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Post</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleUpdate}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  value={editForm.content}
                  onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Visibility</label>
                  <select
                    value={editForm.visibility}
                    onChange={(e) => setEditForm({ ...editForm, visibility: e.target.value })}
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                    <option value="friends">Friends</option>
                  </select>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="addToPortfolio"
                    checked={editForm.addToPortfolio}
                    onChange={(e) => setEditForm({ ...editForm, addToPortfolio: e.target.checked })}
                    className="mr-2 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                  />
                  <label htmlFor="addToPortfolio" className="text-sm text-gray-700">
                    Add to Portfolio
                  </label>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Media</label>
                {editForm.existingMedia.length > 0 || editForm.files.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {editForm.existingMedia.map((media, idx) => (
                      <div key={`existing-${idx}`} className="relative">
                        {renderMedia(media, idx, true)}
                      </div>
                    ))}
                    {editForm.files.map((file, idx) => (
                      <div key={`new-${idx}`} className="relative">
                        {renderMedia(file, idx + editForm.existingMedia.length, true)}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No media attached.</p>
                )}
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload New Media</label>
                <div className="flex items-center">
                  <label className="flex-1">
                    <div className="flex flex-col items-center justify-center px-4 py-6 border-2 border-dashed border-gray-300 rounded-md hover:border-gray-400 transition-colors cursor-pointer">
                      <svg className="w-10 h-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-sm text-gray-600 text-center">
                        <span className="font-medium text-blue-500">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Images, videos, PDFs (max 10MB each)</p>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*,application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <Link
          to="/profile"
          className="text-blue-500 hover:text-blue-700 text-sm flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Profile
        </Link>
        {posts.length > 2 && (
          <button
            onClick={() => setShowAllPosts(!showAllPosts)}
            className="text-blue-500 hover:text-blue-700 text-sm flex items-center"
          >
            {showAllPosts ? 'Show Less' : 'View All Posts and Polls'}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 ml-1 transition-transform ${showAllPosts ? 'rotate-90' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

const PostCard = ({ post, user, handleEdit, handleDelete, renderMedia }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm h-full flex flex-col">
      <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-start">
        <img
          src={user.profileImage || '/assets/avatar.png'}
          alt="Profile"
          className="w-10 h-10 rounded-full mr-3 object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/assets/avatar.png';
          }}
        />
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="font-semibold text-gray-800">{user.name || 'SkillNest User'}</h2>
              <div className="flex items-center space-x-2 mt-1">
                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 flex-1">
        <h3 className="font-medium text-gray-800 mb-2">{post.title}</h3>
        <p className="text-gray-700 mb-4">{post.content}</p>
        
        {post.mediaUrls?.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            {post.mediaUrls.map((media, idx) => renderMedia(media, idx))}
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-gray-100">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="text-xs">Like</span>
            </button>
          </div>
          
          <div className="flex space-x-4">
            <button className="text-xs text-gray-500 hover:text-blue-500">
              Repost
            </button>
            <button
              onClick={() => handleEdit(post)}
              className="text-xs text-blue-500 hover:text-blue-700"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(post.id)}
              className="text-xs text-red-500 hover:text-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostsPage;