import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../../api/axios';

const allSkillSuggestions = [
  'Developer', 'Developer Tools', 'Front-End Web Development',
  'DataAccess', 'DE&I', 'Programming', 'Microsoft Office', 
  'DeveloperCommunity', 'DeveloperRelations'
].sort();

const SkillsPage = () => {
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user._id || user.id;
  const token = localStorage.getItem('token');

  // Fetch skills from backend
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await API.get(`/auth/users/${userId}/skills`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSkills(res.data || []);
      } catch (err) {
        console.error('Failed to fetch skills:', err);
        toast.error('Failed to load skills');
      }
    };

    if (userId && token) fetchSkills();
  }, [userId, token]);

  const handleAddSkill = async (skillToAdd) => {
    const trimmedSkill = skillToAdd.trim();
    if (!trimmedSkill) return;
    if (skills.includes(trimmedSkill)) {
      setError('This skill already exists');
      return;
    }
    if (skills.length >= 15) {
      setError('Maximum of 15 skills allowed');
      return;
    }

    const updatedSkills = [...skills, trimmedSkill];
    try {
      setSkills(updatedSkills);
      setNewSkill('');
      setShowSuggestions(false);
      setError(null);
      await API.put(`/auth/users/${userId}/skills`, { skills: updatedSkills }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Skill added');
    } catch (err) {
      console.error('Add skill error:', err);
      toast.error('Failed to save skill');
    }
  };

  const handleRemoveSkill = async (skillToRemove) => {
    const updatedSkills = skills.filter(skill => skill !== skillToRemove);
    try {
      setSkills(updatedSkills);
      await API.put(`/auth/users/${userId}/skills`, { skills: updatedSkills }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Skill removed');
    } catch (err) {
      console.error('Remove skill error:', err);
      toast.error('Failed to remove skill');
    }
  };

  const filteredSuggestions = allSkillSuggestions.filter(
    suggestion =>
      suggestion.toLowerCase().includes(newSkill.toLowerCase()) &&
      !skills.includes(suggestion)
  );

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (inputRef.current && !inputRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredSuggestions.length > 0) {
        handleAddSkill(filteredSuggestions[0]);
      } else if (newSkill.trim()) {
        handleAddSkill(newSkill);
      }
    }
  };

  return (
    <div className="bg-white p-6 shadow rounded-xl max-w-4xl mx-auto">
      <h3 className="text-2xl font-semibold text-gray-800 mb-4">Skills</h3>
      
      <div className="flex gap-4 mb-6">
        <div className="text-lg font-semibold">{skills.length} {skills.length === 1 ? 'skill' : 'skills'}</div>
        <div className="text-lg font-semibold text-gray-500">0 skills with evidence 📄</div>
      </div>

      <div className="mb-4 relative" ref={inputRef}>
        <label htmlFor="skill-input" className="font-semibold block mb-1">
          Add skill tags:
        </label>
        <input
          id="skill-input"
          type="text"
          placeholder="e.g. Programming or Microsoft Office"
          value={newSkill}
          onChange={(e) => {
            setNewSkill(e.target.value);
            setShowSuggestions(true);
            setError(null);
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          aria-describedby="skill-error"
        />

        {error && (
          <p id="skill-error" className="text-red-500 text-sm mt-1">
            {error}
          </p>
        )}

        {showSuggestions && (filteredSuggestions.length > 0 || newSkill.trim()) && (
          <ul className="border border-gray-300 mt-1 rounded shadow-md max-h-48 overflow-auto bg-white z-10 absolute w-full">
            {filteredSuggestions.map((suggestion) => (
              <li
                key={suggestion}
                onClick={() => handleAddSkill(suggestion)}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              >
                #{suggestion}
              </li>
            ))}
            {newSkill.trim() && !filteredSuggestions.includes(newSkill) && !skills.includes(newSkill) && (
              <li
                onClick={() => handleAddSkill(newSkill)}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer bg-blue-50"
              >
                Add new skill: #{newSkill.trim()}
              </li>
            )}
          </ul>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mt-4 min-h-12">
        {skills.length > 0 ? (
          skills.map((skill) => (
            <span
              key={skill}
              className="bg-gray-100 border text-gray-800 px-3 py-1 rounded-full text-sm flex items-center gap-1"
            >
              <span className="font-medium">#{skill}</span>
              <button
                onClick={() => handleRemoveSkill(skill)}
                className="text-gray-500 hover:text-red-500 font-bold text-sm"
                aria-label={`Remove ${skill} skill`}
              >
                ✕
              </button>
            </span>
          ))
        ) : (
          <p className="text-gray-500">No skills added yet</p>
        )}
      </div>

      <div className="mt-8">
        <Link to="/profile" className="text-blue-600 hover:underline inline-flex items-center">
          ← Back to Profile
        </Link>
      </div>
    </div>
  );
};

export default SkillsPage;
