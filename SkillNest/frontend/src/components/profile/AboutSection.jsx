import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import API from '../../api/axios';
import { toast } from 'react-toastify';
import { countries } from 'countries-list';
import { Country, State, City } from "country-state-city";

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
  const [isEditing, setIsEditing] = useState(false);
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

  // Sync form with user data
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

  // Country → States
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

  // State → Cities
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

  const fetchUserData = async (userId, token) => {
    try {
      const res = await API.get(`/auth/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
      });
      if (!res.data) {
        throw new Error('No user data returned');
      }
      localStorage.setItem('user', JSON.stringify(res.data));
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
  
      // ✅ Merge current user object with form data to avoid overwriting
      const mergedPayload = { ...user, ...form };
  
      await API.put(`/auth/users/${userId}`, mergedPayload, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      const updatedUser = await fetchUserData(userId, token);
      setForm(prev => ({
        ...prev,
        ...updatedUser // update form to reflect all server data
      }));
  
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      setEditSection(null);
    } catch (error) {
      console.error('Update failed:', error);
      setError(error.response?.data?.message || error.message || 'Failed to update profile');
      toast.error(error.response?.data?.message || error.message || 'Failed to update profile');
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
      const updatedUser = await fetchUserData(userId, token);
      setForm(prev => ({
        ...prev,
        resume: updatedUser.resume
      }));
      setResumeFile(null);
      toast.success('Resume uploaded successfully!');
    } catch (error) {
      console.error('Resume upload failed:', error);
      setError(error.response?.data?.message || error.message || 'Failed to upload resume');
      toast.error(error.response?.data?.message || error.message || 'Failed to upload resume');
    } finally {
      setIsLoading(false);
    }
  };

  const startEditing = section => {
    setIsEditing(true);
    setEditSection(section);
    setError(null);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditSection(null);
    setResumeFile(null);
    setError(null);
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
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">About</h2>
          {!isEditing && (
            <button 
              className="text-blue-600 hover:underline" 
              onClick={() => startEditing('about')}
              aria-label="Edit about section"
            >
              Edit
            </button>
          )}
        </div>
        <div className="mb-6">
          <h3 className="text-xl font-medium mb-2">Bio</h3>
          {isEditing && editSection === 'about' ? (
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
          {isEditing && editSection === 'about' ? (
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
            Note: If you upload a PDF resume, SN will automatically fill in some empty sections. Since the autofill may
            contain errors, please review the populated sections and make necessary edits.
          </p>
          {form.resume ? (
            <div className="flex items-center gap-4">
              <a 
                href={form.resume} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 hover:underline"
                aria-label="View current resume"
              >
                View Current Resume
              </a>
              <button
                className="text-blue-600 hover:underline"
                onClick={() => document.getElementById('resume-upload').click()}
                aria-label="Update resume"
              >
                Update Resume
              </button>
            </div>
          ) : (
            <div>
              <p className="text-gray-400 mb-2">No resume uploaded yet</p>
              <button
                className="text-blue-600 hover:underline"
                onClick={() => document.getElementById('resume-upload').click()}
                aria-label="Upload resume"
              >
                + Upload your Resume
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
            <div className="mt-2 flex items-center gap-2">
              <span className="text-sm text-gray-700">{resumeFile.name}</span>
              <button
                onClick={handleFileUpload}
                className="bg-blue-600 text-white px-2 py-1 rounded text-sm hover:bg-blue-700"
                disabled={isLoading}
                aria-label="Upload resume file"
              >
                {isLoading ? 'Uploading...' : 'Upload'}
              </button>
              <button
                onClick={() => setResumeFile(null)}
                className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-sm hover:bg-gray-300"
                aria-label="Cancel resume upload"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </section>
      <hr className="my-6 border-t border-gray-300" />
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Basic Information</h2>
          {!isEditing && (
            <button 
              className="text-blue-600 hover:underline" 
              onClick={() => startEditing('basic')}
              aria-label="Edit basic information"
            >
              Edit
            </button>
          )}
        </div>
        {isEditing && editSection === 'basic' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-medium mb-1">Primary Language</label>
              <select
                name="language"
                value={form.language}
                onChange={handleChange}
                className="w-full p-2 border rounded"
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
                className="w-full p-2 border rounded"
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
                className="w-full p-2 border rounded"
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
                className="w-full p-2 border rounded"
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
                className="w-full p-2 border rounded"
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
                className="w-full p-2 border rounded"
                aria-label="Institution input"
              />
            </div>
            <div>
              <label className="block font-medium mb-1">Role/Status</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full p-2 border rounded"
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
                className="w-full p-2 border rounded"
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
      </section>
      <hr className="my-6 border-t border-gray-300" />
      <section>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">Internship/Tutoring</h2>
          {!isEditing && (
            <button 
              className="text-blue-600 hover:underline" 
              onClick={() => startEditing('internship')}
              aria-label="Edit internship information"
            >
              Edit
            </button>
          )}
        </div>
        {isEditing && editSection === 'internship' ? (
          <input
            name="internship"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={form.internship}
            onChange={handleChange}
            placeholder="Enter your internship or tutoring interests"
            aria-label="Internship input"
          />
        ) : (
          <p className="text-gray-700">{form.internship || 'No information provided'}</p>
        )}
      </section>
      {isEditing && (
        <div className="flex justify-end mt-8 space-x-3">
          <button
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
            onClick={cancelEditing}
            disabled={isLoading}
            aria-label="Cancel editing"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            disabled={isLoading}
            aria-label="Save changes"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  );
};

export default AboutPage;