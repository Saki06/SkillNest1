import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../../api/axios';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { MoreVertical, Eye, Edit2, Link2, Trash2 } from 'lucide-react';

const DocumentsPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [file, setFile] = useState(null);
  const [docName, setDocName] = useState('');
  const [description, setDescription] = useState('');
  const [skillTags, setSkillTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [visibility, setVisibility] = useState('private');
  const [folder, setFolder] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [editingDocId, setEditingDocId] = useState(null);
  const [userId, setUserId] = useState('');
  const [showReflectionModal, setShowReflectionModal] = useState(false);
  const [sectionReflection, setSectionReflection] = useState('');
  const [imageUrls, setImageUrls] = useState({});
  const fileInputRef = useRef(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      const id = user._id || user.id;
      setUserId(id);
      fetchDocuments(id);
      const savedReflection = localStorage.getItem('documentsReflection');
      if (savedReflection) {
        setSectionReflection(savedReflection);
      }
    } else {
      toast.error('No user found. Please log in.');
    }
  }, []);

  const fetchDocuments = async (uid) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');
      const res = await API.get(`/auth/users/${uid}/documents`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Fetched documents:', res.data);
      setDocuments([...res.data].reverse());
    } catch (err) {
      toast.error(`Failed to fetch documents: ${err.message}`);
      console.error('Fetch documents error:', err);
    }
  };

  const fetchImage = async (fileUrl) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');
      const response = await API.get(fileUrl, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });
      return URL.createObjectURL(response.data);
    } catch (err) {
      console.error('Failed to fetch image:', err);
      return null;
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadImages = async () => {
      const urls = {};
      for (const doc of documents) {
        if (doc.fileUrl?.match(/\.(jpeg|jpg|png)$/i)) {
          const imageUrl = await fetchImage(doc.fileUrl);
          if (imageUrl && isMounted) {
            urls[doc.id] = imageUrl;
          }
        }
      }
      if (isMounted) {
        setImageUrls(urls);
      }
    };

    loadImages();

    return () => {
      isMounted = false;
      Object.values(imageUrls).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [documents]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
    ];
    const maxSize = 10 * 1024 * 1024;

    if (!validTypes.includes(selectedFile.type)) {
      toast.error('Please upload a PDF, Word, JPG, or PNG file');
      return;
    }

    if (selectedFile.size > maxSize) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setFile(selectedFile);
    if (!docName && !editingDocId) {
      setDocName(selectedFile.name.split('.')[0]);
    }
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && newTag.trim()) {
      if (!skillTags.includes(newTag.trim())) {
        setSkillTags([...skillTags, newTag.trim()]);
        setNewTag('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setSkillTags(skillTags.filter((tag) => tag !== tagToRemove));
  };

  const handleEdit = (doc) => {
    console.log('Editing document:', doc);
    setDocName(doc.name || '');
    setDescription(doc.description || '');
    setVisibility(doc.visibility || 'private');
    setFolder(doc.folder || '');
    setSkillTags(doc.tags || []);
    setEditingDocId(doc.id);
    setFile(null);
    setShowModal(true);
  };

  const handleDelete = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');
      console.log('Deleting document:', docId);
      const res = await API.delete(`/auth/users/${userId}/documents/${docId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Delete response:', res.data);
      toast.success('Document deleted successfully');
      fetchDocuments(userId);
    } catch (err) {
      toast.error(`Failed to delete document: ${err.response?.data?.error || err.message}`);
      console.error('Delete error:', err);
    }
  };

  const handleView = async (fileUrl) => {
    console.log('Viewing document:', fileUrl);
    if (!fileUrl) {
      toast.error('No file URL available');
      return;
    }
    try {
      window.open(`http://localhost:8000${fileUrl}`, '_blank');
    } catch (err) {
      toast.error(`Failed to view document: ${err.message}`);
      console.error('View error:', err);
    }
  };

  const copyToClipboard = (text) => {
    console.log('Copying to clipboard:', text);
    if (!text) {
      toast.error('No URL to copy');
      return;
    }
    navigator.clipboard.writeText(`http://localhost:8000${text}`);
    toast.success('Link copied to clipboard');
  };

  const handleSubmit = async () => {
    if (!docName.trim() || !description.trim()) {
      toast.error('Please fill all required fields');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to continue');
      return;
    }

    try {
      setIsLoading(true);
      const url = editingDocId
        ? `/auth/users/${userId}/documents/${editingDocId}`
        : `/auth/users/${userId}/documents`;
      const method = editingDocId ? 'put' : 'post';

      if (editingDocId && !file) {
        // Update without file
        const params = new URLSearchParams({
          name: docName,
          description,
          visibility,
          folder: folder || '',
          tags: skillTags.join(','),
        });
        console.log('Updating document:', { url, method, params });
        await API.put(url, params, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        });
      } else {
        // Create or update with file
        const formData = new FormData();
        if (file) {
          formData.append('file', file);
        }
        formData.append('name', docName);
        formData.append('description', description);
        formData.append('visibility', visibility);
        if (folder) formData.append('folder', folder);
        skillTags.forEach((tag) => formData.append('tags', tag));
        console.log('Submitting document:', { url, method, formData });
        await API[method](url, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      toast.success(editingDocId ? 'Document updated successfully' : 'Document uploaded successfully');
      resetForm();
      fetchDocuments(userId);
    } catch (err) {
      toast.error(err.response?.data?.error || `Operation failed: ${err.message}`);
      console.error('Submit error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const saveReflection = () => {
    localStorage.setItem('documentsReflection', sectionReflection);
    setShowReflectionModal(false);
    toast.success('Reflection saved successfully');
  };

  const resetForm = () => {
    setFile(null);
    setDocName('');
    setDescription('');
    setSkillTags([]);
    setNewTag('');
    setVisibility('private');
    setFolder('');
    setEditingDocId(null);
    setShowModal(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getVisibilityIcon = (vis) => {
    switch (vis) {
      case 'public':
        return '🌐';
      case 'hidden':
        return '🔗';
      default:
        return '🔒';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown Date';
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? 'Unknown Date'
      : date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-white p-6 shadow rounded-xl max-w-4xl mx-auto">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-2xl font-bold inline mr-2">Documents</h3>
          <button
            className="text-blue-600 hover:underline text-sm"
            onClick={() => setShowReflectionModal(true)}
          >
            Add Reflection
          </button>
        </div>
        <Link to="/profile" className="text-blue-600 hover:underline">
          ← Back to Profile
        </Link>
      </div>

      <div className="space-y-3 mb-6">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="border rounded-lg p-4 hover:bg-gray-50 relative group flex gap-4 items-start"
          >
            {doc.fileUrl?.match(/\.(jpeg|jpg|png)$/i) && imageUrls[doc.id] ? (
              <img
                src={imageUrls[doc.id]}
                alt={doc.name}
                className="w-20 h-20 object-cover rounded border"
                onError={(e) => (e.target.src = '/placeholder.png')}
              />
            ) : (
              <div className="w-20 h-20 flex items-center justify-center bg-gray-200 text-gray-600 text-3xl rounded">
                📄
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-lg truncate">
                  {doc.name} {getVisibilityIcon(doc.visibility)}
                </h4>
                {doc.folder && (
                  <span className="ml-2 bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded-full">
                    {doc.folder}
                  </span>
                )}
              </div>
              <p className="text-gray-600 text-sm mt-1 truncate">{doc.description || 'No description provided'}</p>
              <p className="text-gray-500 text-xs mt-1">Uploaded on {formatDate(doc.uploadedAt)}</p>

              {doc.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {doc.tags.map((tag, idx) => (
                    <span key={idx} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-200">
                    <MoreVertical size={18} />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    align="end"
                    className="w-40 bg-white border rounded shadow-lg p-1 z-50"
                  >
                    <DropdownMenu.Item
                      onSelect={() => handleView(doc.fileUrl)}
                      className="flex items-center px-2 py-1.5 text-sm hover:bg-gray-100 cursor-pointer"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      <span>View</span>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      onSelect={() => handleEdit(doc)}
                      className="flex items-center px-2 py-1.5 text-sm hover:bg-gray-100 cursor-pointer"
                    >
                      <Edit2 className="mr-2 h-4 w-4" />
                      <span>Edit</span>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      onSelect={() => copyToClipboard(doc.fileUrl)}
                      className="flex items-center px-2 py-1.5 text-sm hover:bg-gray-100 cursor-pointer"
                    >
                      <Link2 className="mr-2 h-4 w-4" />
                      <span>Copy Link</span>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      onSelect={() => handleDelete(doc.id)}
                      className="flex items-center px-2 py-1.5 text-sm text-red-600 hover:bg-gray-100 cursor-pointer"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Delete</span>
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </div>
          </div>
        ))}
      </div>

      <div
        className="border-2 border-dashed border-blue-400 p-8 rounded-lg cursor-pointer text-center hover:bg-blue-50"
        onClick={() => setShowModal(true)}
      >
        <div className="text-3xl mb-2">📄</div>
        <p className="text-blue-600 font-medium">Add a Document or Folder</p>
        <p className="text-gray-500 text-sm">Supports PDF, Word, JPG, and PNG documents</p>
      </div>

      {showReflectionModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50 p-4"
          role="dialog"
          aria-labelledby="reflection-modal-title"
        >
          <div className="bg-white rounded-lg p-6 shadow-xl w-full max-w-xl">
            <div className="flex justify-between items-center mb-4">
              <h4 id="reflection-modal-title" className="text-xl font-semibold">
                Add Section Reflection
              </h4>
              <button
                className="text-gray-500 hover:text-gray-700 text-2xl"
                onClick={() => setShowReflectionModal(false)}
                aria-label="Close reflection modal"
              >
                ✕
              </button>
            </div>
            <textarea
              placeholder="Write your overall reflection about this section..."
              className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={5}
              value={sectionReflection}
              onChange={(e) => setSectionReflection(e.target.value)}
              aria-label="Section reflection"
            />
            <div className="flex justify-end mt-4 space-x-2">
              <button
                onClick={() => setShowReflectionModal(false)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={saveReflection}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save Reflection
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50 p-4"
          role="dialog"
          aria-labelledby="document-modal-title"
        >
          <div className="bg-white rounded-lg p-6 shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h4 id="document-modal-title" className="text-xl font-semibold">
                {editingDocId ? 'Edit Document' : 'Add Document'}
              </h4>
              <button
                className="text-gray-500 hover:text-gray-700 text-2xl"
                onClick={resetForm}
                disabled={isLoading}
                aria-label="Close document modal"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Document File {!editingDocId && '*'}
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  disabled={isLoading}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {editingDocId && !file && (
                  <p className="text-sm text-gray-600 mt-1">
                    Current file: {documents.find((d) => d.id === editingDocId)?.name || 'Unknown'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Document Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. AI/ML Engineer - Stage 1"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  disabled={isLoading}
                  aria-required="true"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description/Reflection *
                </label>
                <textarea
                  placeholder="Describe this document and your reflections..."
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isLoading}
                  aria-required="true"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Skill Tags
                </label>
                <input
                  type="text"
                  placeholder="Type a skill and press Enter"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={handleAddTag}
                  disabled={isLoading}
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {skillTags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 text-blue-600 hover:text-blue-900"
                        disabled={isLoading}
                        aria-label={`Remove ${tag} tag`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Visibility *
                </label>
                <select
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                  disabled={isLoading}
                  aria-required="true"
                >
                  <option value="private">Private (only me)</option>
                  <option value="public">Public (everyone)</option>
                  <option value="hidden">Hidden (link only)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Folder (optional)
                </label>
                <select
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={folder}
                  onChange={(e) => setFolder(e.target.value)}
                  disabled={isLoading}
                >
                  <option value="">No folder</option>
                  <option value="resumes">Resumes</option>
                  <option value="certificates">Certificates</option>
                  <option value="transcripts">Transcripts</option>
                  <option value="projects">Projects</option>
                  <option value="ai-ml">AI/ML</option>
                </select>
              </div>

              <button
                onClick={handleSubmit}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading
                  ? editingDocId
                    ? 'Updating...'
                    : 'Uploading...'
                  : editingDocId
                  ? 'Update Document'
                  : 'Upload Document'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentsPage;