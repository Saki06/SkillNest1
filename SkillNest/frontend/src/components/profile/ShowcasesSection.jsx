import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { MoreVertical, Edit2, Link2, Trash2, ExternalLink, Plus } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../../api/axios';

const ShowcasesPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [viewFileModal, setViewFileModal] = useState(false);
  const [file, setFile] = useState(null);
  const [mediaType, setMediaType] = useState('upload');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [projectUrl, setProjectUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showcases, setShowcases] = useState([]);
  const [editingShowcaseId, setEditingShowcaseId] = useState(null);
  const [selectedFileUrl, setSelectedFileUrl] = useState(null);
  const [userId, setUserId] = useState('');
  const [imageUrls, setImageUrls] = useState({});
  const [existingFilePath, setExistingFilePath] = useState(null);
  const fileInputRef = useRef(null);
  const [error, setError] = useState(null);
  const [showFullDescription, setShowFullDescription] = useState({}); // State to track description visibility per showcase

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      const id = user._id || user.id;
      setUserId(id);
      fetchShowcases(id);
    } else {
      toast.error('No user found. Please log in.');
    }
  }, []);

  const fetchShowcases = async (uid) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');
      const res = await API.get(`/auth/users/${uid}/showcases`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowcases([...res.data].reverse());
      // Initialize showFullDescription state for new showcases
      const initialVisibility = res.data.reduce((acc, showcase) => ({
        ...acc,
        [showcase.id]: false,
      }), {});
      setShowFullDescription(initialVisibility);
    } catch (err) {
      toast.error(`Failed to fetch showcases: ${err.message}`);
      console.error('Fetch showcases error:', err);
    }
  };

  const fetchImage = async (filePath) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');
  
      const fileName = filePath.split('/').pop();
      const url = `/auth/users/${userId}/showcases/view/${fileName}`;
  
      const response = await API.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });
  
      return URL.createObjectURL(response.data);
    } catch (err) {
      console.error('Failed to fetch image:', err);
      return '/placeholder.png'; // fallback image
    }
  };
  

  useEffect(() => {
    let isMounted = true;

    const loadImages = async () => {
      const urls = {};
      for (const showcase of showcases) {
        if (showcase.filePath?.match(/\.(jpeg|jpg|png)$/i)) { // Focus on images first
          const imageUrl = await fetchImage(showcase.filePath);
          if (isMounted) {
            urls[showcase.id] = imageUrl;
          }
        }
      }
      if (isMounted) {
        setImageUrls((prev) => ({ ...prev, ...urls }));
      }
    };

    loadImages();

    return () => {
      isMounted = false;
      Object.values(imageUrls).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [showcases]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    const maxSize = 10 * 1024 * 1024;

    if (!validTypes.includes(selectedFile.type)) {
      toast.error('Please upload a PDF, JPG, or PNG file');
      return;
    }

    if (selectedFile.size > maxSize) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setFile(selectedFile);
    setExistingFilePath(null);
    if (!title && !editingShowcaseId) {
      setTitle(selectedFile.name.split('.')[0]);
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && skills.length < 5 && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    } else if (skills.length >= 5) {
      toast.error('You can add a maximum of 5 skills.');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  const handleEdit = (showcase) => {
    if (showcase.userId !== userId) {
      toast.error('You can only edit your own showcases.');
      return;
    }
    setTitle(showcase.title || '');
    setDescription(showcase.description || '');
    setSkills(showcase.skills || []);
    setVisibility(showcase.visibility || 'public');
    setProjectUrl(showcase.projectUrl || '');
    setMediaType(showcase.filePath ? 'upload' : showcase.projectUrl ? 'link' : 'upload');
    setEditingShowcaseId(showcase.id);
    setFile(null);
    setExistingFilePath(showcase.filePath || null);
    setShowModal(true);
  };

  const handleDelete = async (showcaseId) => {
    const showcase = showcases.find((s) => s.id === showcaseId);
    if (showcase.userId !== userId) {
      toast.error('You can only delete your own showcases.');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this showcase?')) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');
      await API.delete(`/auth/users/${userId}/showcases/${showcaseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Showcase deleted successfully');
      fetchShowcases(userId);
    } catch (err) {
      toast.error(`Failed to delete showcase: ${err.response?.data?.error || err.message}`);
    }
  };

  const copyToClipboard = (text) => {
    if (!text) {
      toast.error('No URL to copy');
      return;
    }
    navigator.clipboard.writeText(`http://localhost:8000${text}`);
    toast.success('Link copied to clipboard');
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('Project name is required');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to continue');
      return;
    }

    try {
      setIsLoading(true);
      const url = editingShowcaseId
        ? `/auth/users/${userId}/showcases/${editingShowcaseId}`
        : `/auth/users/${userId}/showcases`;
      const method = editingShowcaseId ? 'put' : 'post';

      const formData = new FormData();
      if (file && mediaType === 'upload') {
        formData.append('file', file);
      } else if (existingFilePath && mediaType === 'upload') {
        formData.append('existingFilePath', existingFilePath);
      }
      if (projectUrl && mediaType === 'link') {
        formData.append('projectUrl', projectUrl);
      }
      formData.append('title', title);
      formData.append('description', description);
      formData.append('visibility', visibility);
      skills.forEach((skill) => formData.append('skills', skill));

      await API[method](url, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success(editingShowcaseId ? 'Showcase updated successfully' : 'Showcase added successfully');
      resetForm();
      fetchShowcases(userId);
    } catch (err) {
      toast.error(err.response?.data?.error || `Operation failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setMediaType('upload');
    setTitle('');
    setDescription('');
    setSkills([]);
    setNewSkill('');
    setVisibility('public');
    setProjectUrl('');
    setEditingShowcaseId(null);
    setExistingFilePath(null);
    setShowModal(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getVisibilityIcon = (vis) => {
    switch (vis) {
      case 'public':
        return '🌐 Public';
      case 'hidden':
        return '🔗 Link only';
      default:
        return '🔒 Private';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown Date';
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? 'Unknown Date'
      : date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  const handleViewFile = (filePath) => {
    const fileName = filePath.split('/').pop();
    const fullUrl = `http://localhost:8000/api/auth/users/${userId}/showcases/view/${fileName}`;
    setSelectedFileUrl(fullUrl);
    setViewFileModal(true);
  };
  

  const toggleDescription = (showcaseId) => {
    setShowFullDescription((prev) => ({
      ...prev,
      [showcaseId]: !prev[showcaseId],
    }));
  };

  return (
    <div className="bg-white p-6 rounded-lg max-w-4xl mx-auto">
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Projects</h1>
            <p className="text-sm text-gray-600 mt-1">
              Showcase your projects to highlight your skills and experience
            </p>
          </div>
          <Link 
            to="/profile" 
            className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
          >
            ← Back to Profile
          </Link>
        </div>
      </div>

      {/* Showcases Grid - LinkedIn-like Cards */}
      <div className="space-y-4 mb-8">
        {showcases.map((showcase) => (
          <div
            key={showcase.id}
            className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all duration-200 bg-white"
          >
            {/* Media Preview - LinkedIn-like header */}
            {showcase.filePath?.match(/\.(jpeg|jpg|png)$/i) && imageUrls[showcase.id] ? (
              <div className="w-full h-48 bg-gray-100 overflow-hidden relative">
                <img
                  src={imageUrls[showcase.id]}
                  alt={showcase.title}
                  className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => handleViewFile(showcase.filePath)}
                  onError={(e) => (e.target.src = '/placeholder.png')}
                />
              </div>
            ) : showcase.filePath?.match(/\.pdf$/i) && imageUrls[showcase.id] ? (
              <div
                className="w-full h-48 flex items-center justify-center cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                onClick={() => handleViewFile(showcase.filePath)}
              >
                <div className="text-center p-4">
                  <span className="text-4xl text-gray-400 block mb-2">📄</span>
                  <span className="text-sm text-gray-600 font-medium">View PDF Document</span>
                </div>
              </div>
            ) : showcase.projectUrl ? (
              <div className="w-full h-48 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                <div className="text-center p-4">
                  <ExternalLink size={32} className="mx-auto text-blue-500 mb-2" />
                  <a
                    href={showcase.projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Visit Project
                  </a>
                </div>
              </div>
            ) : (
              <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <span className="text-4xl block mb-2">📂</span>
                  <span className="text-sm font-medium">No media attached</span>
                </div>
              </div>
            )}

            {/* Showcase Content - LinkedIn-like */}
            <div className="p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg leading-tight">{showcase.title}</h3>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <span>{formatDate(showcase.createdAt)} - {formatDate(showcase.updatedAt || showcase.createdAt)}</span>
                    {showcase.associatedWith && (
                      <span className="ml-2 text-blue-600">{showcase.associatedWith}</span>
                    )}
                  </div>
                </div>
                {showcase.userId === userId && (
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                      <button className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
                        <MoreVertical size={18} />
                      </button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Portal>
                      <DropdownMenu.Content
                        align="end"
                        className="min-w-[160px] bg-white rounded-md shadow-lg border border-gray-200 z-50"
                      >
                        <DropdownMenu.Item
                          onSelect={() => handleEdit(showcase)}
                          className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                        >
                          <Edit2 className="mr-2 h-4 w-4" />
                          <span>Edit</span>
                        </DropdownMenu.Item>
                        {showcase.filePath && (
                          <DropdownMenu.Item
                            onSelect={() => copyToClipboard(showcase.filePath)}
                            className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                          >
                            <Link2 className="mr-2 h-4 w-4" />
                            <span>Copy Link</span>
                          </DropdownMenu.Item>
                        )}
                        <DropdownMenu.Item
                          onSelect={() => handleDelete(showcase.id)}
                          className="flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete</span>
                        </DropdownMenu.Item>
                      </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Root>
                )}
              </div>

              {showcase.description && (
                <div className="text-sm text-gray-600 mb-4">
                  {showFullDescription[showcase.id] ? (
                    <p style={{ whiteSpace: 'pre-line' }}>{showcase.description}</p>
                  ) : (
                    <p style={{ whiteSpace: 'pre-line' }}>
                      {showcase.description.length > 100
                        ? `${showcase.description.substring(0, 100)}...`
                        : showcase.description}
                    </p>
                  )}
                  {showcase.description.length > 100 && (
                    <button
                      onClick={() => toggleDescription(showcase.id)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-1"
                    >
                      {showFullDescription[showcase.id] ? 'see less' : 'see more'}
                    </button>
                  )}
                </div>
              )}

              {showcase.skills?.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-xs font-semibold text-gray-500 mb-2">SKILLS</h4>
                  <div className="flex flex-wrap gap-2">
                    {showcase.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="inline-block bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {showcase.projectUrl && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <a
                    href={showcase.projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center text-sm font-medium"
                  >
                    <ExternalLink size={14} className="mr-1" />
                    Visit Project
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add New Showcase Button - LinkedIn-style */}
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 cursor-pointer transition-colors duration-200"
        onClick={() => setShowModal(true)}
      >
        <div className="text-blue-500 mb-2">
          <Plus size={32} className="mx-auto" />
        </div>
        <p className="font-medium text-gray-700">Add new project</p>
        <p className="text-xs text-gray-500 mt-1">Showcase your work</p>
      </div>

      {/* View File Modal */}
      {viewFileModal && selectedFileUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center border-b border-gray-200 p-4">
              <h4 className="text-lg font-semibold text-gray-800">Project Media</h4>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setViewFileModal(false)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-gray-50">
              {selectedFileUrl.match(/\.(jpeg|jpg|png)$/i) ? (
                <img
                  src={selectedFileUrl}
                  alt="Project Media"
                  className="w-full h-auto max-h-[70vh] object-contain mx-auto rounded-lg shadow-md"
                />
              ) : selectedFileUrl.match(/\.pdf$/i) ? (
                <iframe
                  src={selectedFileUrl}
                  title="PDF Viewer"
                  className="w-full h-[70vh] border-0 rounded-lg"
                />
              ) : (
                <div className="text-center py-10 text-gray-600">
                  Unsupported file type
                </div>
              )}
            </div>
            <div className="border-t border-gray-200 p-4 flex justify-end space-x-3">
              <a
                href={selectedFileUrl}
                download
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm font-medium"
              >
                Download
              </a>
              <button
                onClick={() => setViewFileModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Showcase Modal - LinkedIn-style */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50 p-5">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="border-b border-gray-200 p-4">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-semibold text-gray-800">
                  {editingShowcaseId ? 'Edit Project' : 'Add Project'}
                </h4>
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={resetForm}
                  disabled={isLoading}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Project title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  placeholder="Describe your project..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isLoading}
                  maxLength={2000}
                />
                <p className="text-xs text-gray-500 mt-1 text-right">
                  {description.length}/2000 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Skills
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Add a skill..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    disabled={isLoading || skills.length >= 5}
                  />
                  <button
                    onClick={handleAddSkill}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                    disabled={isLoading || skills.length >= 5 || !newSkill.trim()}
                  >
                    Add
                  </button>
                </div>
                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
                      >
                        {skill}
                        <button
                          onClick={() => handleRemoveSkill(skill)}
                          className="ml-2 text-blue-600 hover:text-blue-900"
                          disabled={isLoading}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {skills.length}/5 skills added
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Media
                </label>
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setMediaType('upload')}
                      className={`px-3 py-2 rounded-md text-sm font-medium flex-1 ${
                        mediaType === 'upload'
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      onClick={() => setMediaType('link')}
                      className={`px-3 py-2 rounded-md text-sm font-medium flex-1 ${
                        mediaType === 'link'
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Project Link
                    </button>
                  </div>

                  {mediaType === 'upload' && (
                    <div className="border border-gray-300 rounded-md p-4">
                      {existingFilePath && !file && (
                        <div className="mb-3 p-2 bg-gray-100 rounded-md flex items-center justify-between">
                          <div className="flex items-center">
                            {existingFilePath.match(/\.(jpeg|jpg|png)$/i) ? (
                              <img
                                src={`http://localhost:8000${existingFilePath}`}
                                alt="Current file"
                                className="w-12 h-12 object-cover rounded mr-2"
                                onError={(e) => (e.target.src = '/placeholder.png')}
                              />
                            ) : (
                              <span className="text-2xl mr-2">📄</span>
                            )}
                            <span className="text-sm text-gray-600 truncate">
                              {existingFilePath.split('/').pop()}
                            </span>
                          </div>
                          <button
                            onClick={() => setExistingFilePath(null)}
                            className="text-red-600 hover:text-red-800"
                            disabled={isLoading}
                          >
                            Remove
                          </button>
                        </div>
                      )}
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".pdf,.jpg,.jpeg,.png"
                        disabled={isLoading}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Supported formats: PDF, JPG, PNG (Max 10MB)
                      </p>
                    </div>
                  )}

                  {mediaType === 'link' && (
                    <div>
                      <input
                        type="url"
                        placeholder="https://example.com/project"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        value={projectUrl}
                        onChange={(e) => setProjectUrl(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Visibility
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                  disabled={isLoading}
                >
                  <option value="public">Public (Visible to everyone)</option>
                  <option value="hidden">Hidden (Only accessible via link)</option>
                </select>
              </div>

              <button
                onClick={handleSubmit}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save Project'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShowcasesPage;