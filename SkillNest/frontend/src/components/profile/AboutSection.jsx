import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import API from '../../api/axios';
import { toast } from 'react-toastify';
import { countries } from 'countries-list';
import { Country, State, City } from "country-state-city";
import { PlusCircle, Edit, X, Check } from 'lucide-react';

const AboutPage = () => {
  const { user } = useOutletContext();
  const [form, setForm] = useState({
    bio: '',
    tagline: '',
    gender: '',
    country: '',
    state: '',
    city: '',
    role: '',
    institution: '',
    language: '',
    internship: '',
    fieldOfStudy: '',
    resume: '',
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editSection, setEditSection] = useState(null);
  const [error, setError] = useState(null);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'si', name: 'Sinhala' },
    { code: 'ta', name: 'Tamil' },
  ];
  const genders = ['Male', 'Female', 'Other', 'Prefer not to say'];
  const roles = [
    'Undergraduate Student',
    'Graduate Student',
    'PhD Candidate',
    'Postdoctoral Researcher',
    'Faculty',
    'Researcher',
    'Other',
  ];
  const countryList = Object.entries(countries)
    .map(([code, country]) => ({
      code,
      name: country.name,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setForm({
        bio: user.bio || '',
        tagline: user.tagline || '',
        gender: user.gender || '',
        country: user.country || '',
        state: user.state || '',
        city: user.city || '',
        role: user.role || '',
        institution: user.institution || '',
        language: user.language || '',
        internship: user.internship || '',
        fieldOfStudy: user.fieldOfStudy || '',
        resume: user.resume || '',
      });
    }
  }, [user]);

  // Update states when country changes
  useEffect(() => {
    if (form.country) {
      const stateList = State.getStatesOfCountry(form.country);
      setStates(stateList || []);
      setForm(prev => ({ ...prev, state: '', city: '' }));
      setCities([]);
    } else {
      setStates([]);
      setCities([]);
    }
  }, [form.country]);

  // Update cities when state changes
  useEffect(() => {
    if (form.state && form.country) {
      const cityList = City.getCitiesOfState(form.country, form.state);
      setCities(cityList || []);
      setForm(prev => ({ ...prev, city: '' }));
    } else {
      setCities([]);
    }
  }, [form.state, form.country]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = e => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size should be less than 5MB');
      return;
    }
    
    setResumeFile(file);
  };

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');
      
      const userId = user._id || user.id;
      const res = await API.get(`/auth/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.data) {
        throw new Error('No user data returned');
      }
      
      return res.data;
    } catch (error) {
      console.error('Failed to fetch user:', error);
      throw error;
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Please log in');
      
      const userId = user._id || user.id;
      const payload = { ...form };
      
      // Don't send empty fields that shouldn't be updated
      Object.keys(payload).forEach(key => {
        if (payload[key] === '') {
          delete payload[key];
        }
      });

      await API.put(`/auth/users/${userId}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const updatedUser = await fetchUserData();
      setForm(prev => ({
        ...prev,
        ...updatedUser
      }));
      
      toast.success('Profile updated successfully!');
      setEditSection(null);
    } catch (error) {
      console.error('Update failed:', error);
      const errorMessage = error.response?.data?.message || 
                         error.message || 
                         'Failed to update profile';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!resumeFile) {
      toast.error('Please select a resume file first');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Please log in');
      
      const userId = user._id || user.id;
      const formData = new FormData();
      formData.append('resume', resumeFile);
      
      const res = await API.post(`/auth/users/${userId}/resume`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const updatedUser = await fetchUserData();
      setForm(prev => ({
        ...prev,
        resume: updatedUser.resume
      }));
      setResumeFile(null);
      
      toast.success('Resume uploaded successfully!');
    } catch (error) {
      console.error('Resume upload failed:', error);
      const errorMessage = error.response?.data?.message || 
                         error.message || 
                         'Failed to upload resume';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const startEditing = section => {
    setEditSection(section);
    setError(null);
  };

  const cancelEditing = () => {
    setEditSection(null);
    setResumeFile(null);
    setError(null);
    
    // Reset form to current user data
    if (user) {
      setForm({
        bio: user.bio || '',
        tagline: user.tagline || '',
        gender: user.gender || '',
        country: user.country || '',
        state: user.state || '',
        city: user.city || '',
        role: user.role || '',
        institution: user.institution || '',
        language: user.language || '',
        internship: user.internship || '',
        fieldOfStudy: user.fieldOfStudy || '',
        resume: user.resume || '',
      });
    }
  };

  if (!user) {
    return (
      <div className="text-center p-10 text-red-500">
        User data not available. Please try refreshing the page.
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl max-w-4xl mx-auto">
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <h1 className="text-3xl font-bold mb-8">About</h1>
      
      {/* About Section */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">About</h2>
          {editSection !== 'about' && (
            <button 
              className="text-blue-600 hover:text-blue-800 flex items-center gap-1" 
              onClick={() => startEditing('about')}
              aria-label="Edit about section"
            >
              <Edit size={18} /> Edit
            </button>
          )}
        </div>
        
        <div className="mb-6">
          <h3 className="text-xl font-medium mb-2">Bio</h3>
          {editSection === 'about' ? (
            <>
              <textarea
                name="bio"
                className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="5"
                value={form.bio}
                onChange={handleChange}
                placeholder="Tell us about yourself..."
                maxLength={500}
                aria-label="Bio text area"
              />
              <p className="text-sm text-gray-500 mt-1">{form.bio.length}/500 characters</p>
            </>
          ) : (
            <p className="text-gray-700 whitespace-pre-line">
              {form.bio || <span className="text-gray-400">No bio added yet</span>}
            </p>
          )}
        </div>
        
        <div className="mb-6">
          <h3 className="text-xl font-medium mb-2">Tagline</h3>
          {editSection === 'about' ? (
            <>
              <input
                name="tagline"
                className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={form.tagline}
                onChange={handleChange}
                placeholder="Your professional tagline"
                maxLength={100}
                aria-label="Tagline input"
              />
              <p className="text-sm text-gray-500 mt-1">{form.tagline.length}/100 characters</p>
            </>
          ) : (
            <p className="text-gray-700">
              {form.tagline || <span className="text-gray-400">No tagline added yet</span>}
            </p>
          )}
        </div>
        
        <div className="mb-6">
          <h3 className="text-xl font-medium mb-2">Resume</h3>
          <p className="text-sm text-gray-600 mb-2">
            Note: If you upload a PDF resume, SN will automatically fill in some empty sections. 
            Since the autofill may contain errors, please review the populated sections and make necessary edits.
          </p>
          
          {form.resume ? (
            <div className="flex items-center gap-4">
              <a 
                href={`http://localhost:8000/uploads/${encodeURIComponent(form.resume.replace(/^\/?uploads\//, ''))}`}


                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 hover:underline"
                aria-label="View current resume"
              >
                View Current Resume
              </a>
              <button
                className="text-blue-600 hover:underline flex items-center gap-1"
                onClick={() => document.getElementById('resume-upload').click()}
                aria-label="Update resume"
              >
                <Edit size={16} /> Update
              </button>
            </div>
          ) : (
            <div>
              <p className="text-gray-400 mb-2">No resume uploaded yet</p>
              <button
                className="text-blue-600 hover:underline flex items-center gap-1"
                onClick={() => document.getElementById('resume-upload').click()}
                aria-label="Upload resume"
              >
                <PlusCircle size={16} /> Upload Resume
              </button>
            </div>
          )}
          
          <input
            id="resume-upload"
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept="application/pdf"
            aria-label="Resume upload"
          />
          
          {resumeFile && (
            <div className="mt-4 p-3 border rounded bg-gray-50">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">{resumeFile.name}</span>
                <span className="text-xs text-gray-500">
                  {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleFileUpload}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center gap-1"
                  disabled={isLoading}
                  aria-label="Upload resume file"
                >
                  {isLoading ? 'Uploading...' : (
                    <>
                      <Check size={16} /> Confirm Upload
                    </>
                  )}
                </button>
                <button
                  onClick={() => setResumeFile(null)}
                  className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300 flex items-center gap-1"
                  aria-label="Cancel resume upload"
                >
                  <X size={16} /> Cancel
                </button>
              </div>
            </div>
          )}
        </div>
        
        {editSection === 'about' && (
          <div className="flex justify-end mt-4 gap-3">
            <button
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 flex items-center gap-1"
              onClick={cancelEditing}
              disabled={isLoading}
              aria-label="Cancel editing"
            >
              <X size={18} /> Cancel
            </button>
            <button
              onClick={handleSave}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 flex items-center gap-1"
              disabled={isLoading}
              aria-label="Save changes"
            >
              {isLoading ? 'Saving...' : (
                <>
                  <Check size={18} /> Save Changes
                </>
              )}
            </button>
          </div>
        )}
      </section>

      <hr className="my-6 border-t border-gray-300" />

      {/* Basic Information Section */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Basic Information</h2>
          {editSection !== 'basic' && (
            <button 
              className="text-blue-600 hover:text-blue-800 flex items-center gap-1" 
              onClick={() => startEditing('basic')}
              aria-label="Edit basic information"
            >
              <Edit size={18} /> Edit
            </button>
          )}
        </div>
        
        {editSection === 'basic' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-medium mb-1">Primary Language</label>
              <select
                name="language"
                value={form.language}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                aria-label="Select language"
              >
                <option value="">Select language</option>
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block font-medium mb-1">Gender</label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                aria-label="Select gender"
              >
                <option value="">Select gender</option>
                {genders.map(gender => (
                  <option key={gender} value={gender}>{gender}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block font-medium mb-1">Country/Region</label>
              <select
                name="country"
                value={form.country}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                aria-label="Select country"
              >
                <option value="">Select country</option>
                {countryList.map(country => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block font-medium mb-1">State/Province</label>
              <select
                name="state"
                value={form.state}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                disabled={!form.country}
                aria-label="Select state"
              >
                <option value="">Select state</option>
                {states.map(state => (
                  <option key={state.isoCode} value={state.isoCode}>
                    {state.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block font-medium mb-1">City</label>
              <select
                name="city"
                value={form.city}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                disabled={!form.state}
                aria-label="Select city"
              >
                <option value="">Select city</option>
                {cities.map(city => (
                  <option key={city.name} value={city.name}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block font-medium mb-1">Primary Institution</label>
              <input
                type="text"
                name="institution"
                value={form.institution}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder="University or organization"
                aria-label="Institution input"
              />
            </div>
            
            <div>
              <label className="block font-medium mb-1">Role/Status</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                aria-label="Select role"
              >
                <option value="">Select role</option>
                {roles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block font-medium mb-1">Field of Study</label>
              <input
                type="text"
                name="fieldOfStudy"
                value={form.fieldOfStudy}
                onChange={handleChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                placeholder="Your academic discipline"
                aria-label="Field of study input"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="font-medium">Email:</p>
              <p className="text-gray-700">{user.email}</p>
            </div>
            
            <div>
              <p className="font-medium">Primary Language:</p>
              <p className="text-gray-700">
                {languages.find(l => l.code === form.language)?.name || 'Not specified'}
              </p>
            </div>
            
            <div>
              <p className="font-medium">Gender:</p>
              <p className="text-gray-700">{form.gender || 'Not specified'}</p>
            </div>
            
            <div>
              <p className="font-medium">Country/Region:</p>
              <p className="text-gray-700">
                {countryList.find(c => c.code === form.country)?.name || 'Not specified'}
              </p>
            </div>
            
            <div>
              <p className="font-medium">State/Province:</p>
              <p className="text-gray-700">
                {states.find(s => s.isoCode === form.state)?.name || form.state || 'Not specified'}
              </p>
            </div>
            
            <div>
              <p className="font-medium">City:</p>
              <p className="text-gray-700">{form.city || 'Not specified'}</p>
            </div>
            
            <div>
              <p className="font-medium">Primary Institution:</p>
              <p className="text-gray-700">{form.institution || 'Not specified'}</p>
            </div>
            
            <div>
              <p className="font-medium">Role/Status:</p>
              <p className="text-gray-700">{form.role || 'Not specified'}</p>
            </div>
            
            <div>
              <p className="font-medium">Field of Study:</p>
              <p className="text-gray-700">{form.fieldOfStudy || 'Not specified'}</p>
            </div>
          </div>
        )}
        
        {editSection === 'basic' && (
          <div className="flex justify-end mt-4 gap-3">
            <button
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 flex items-center gap-1"
              onClick={cancelEditing}
              disabled={isLoading}
              aria-label="Cancel editing"
            >
              <X size={18} /> Cancel
            </button>
            <button
              onClick={handleSave}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 flex items-center gap-1"
              disabled={isLoading}
              aria-label="Save changes"
            >
              {isLoading ? 'Saving...' : (
                <>
                  <Check size={18} /> Save Changes
                </>
              )}
            </button>
          </div>
        )}
      </section>

      <hr className="my-6 border-t border-gray-300" />

      {/* Internship Section */}
      <section>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">Internship/Tutoring</h2>
          {editSection !== 'internship' && (
            <button 
              className="text-blue-600 hover:text-blue-800 flex items-center gap-1" 
              onClick={() => startEditing('internship')}
              aria-label="Edit internship information"
            >
              <Edit size={18} /> Edit
            </button>
          )}
        </div>
        
        {editSection === 'internship' ? (
          <div>
            <textarea
              name="internship"
              className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500"
              rows="3"
              value={form.internship}
              onChange={handleChange}
              placeholder="Describe your internship or tutoring interests..."
              aria-label="Internship input"
            />
            <p className="text-sm text-gray-500 mt-1">
              Let others know if you're looking for or offering internships/tutoring
            </p>
          </div>
        ) : (
          <p className="text-gray-700 whitespace-pre-line">
            {form.internship || <span className="text-gray-400">No information provided</span>}
          </p>
        )}
        
        {editSection === 'internship' && (
          <div className="flex justify-end mt-4 gap-3">
            <button
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 flex items-center gap-1"
              onClick={cancelEditing}
              disabled={isLoading}
              aria-label="Cancel editing"
            >
              <X size={18} /> Cancel
            </button>
            <button
              onClick={handleSave}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 flex items-center gap-1"
              disabled={isLoading}
              aria-label="Save changes"
            >
              {isLoading ? 'Saving...' : (
                <>
                  <Check size={18} /> Save Changes
                </>
              )}
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default AboutPage;