import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { toast } from 'react-toastify';

export default function RegisterPage() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    profession: ''
  });
  const navigate = useNavigate();  // Initialize navigate

  const handleRegister = async () => {
    const payload = {
      name: `${form.firstName} ${form.lastName}`.trim(),
      email: form.email,
      password: form.password,
      profession: form.profession
    };
    try {
      const res = await API.post('/auth/register', payload);
      localStorage.setItem('user', JSON.stringify(res.data));
      toast.success('Registration successful');
      navigate('/profile');  // Use navigate for redirection
    } catch {
      toast.error('User already exists!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-100 flex items-center justify-center px-4">
      <div className="bg-white shadow-2xl rounded-2xl max-w-md w-full p-8 md:p-10">
        <h1 className="text-3xl font-bold text-center text-blue-700 mb-6">Create your SkillNest account</h1>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="First Name"
            value={form.firstName}
            onChange={e => setForm({ ...form, firstName: e.target.value })}
            className="w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <input
            type="text"
            placeholder="Last Name"
            value={form.lastName}
            onChange={e => setForm({ ...form, lastName: e.target.value })}
            className="w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            className="w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <textarea
            placeholder="Field of Study / Profession (e.g., Engineering, Math, Marketing)"
            value={form.profession}
            onChange={e => setForm({ ...form, profession: e.target.value })}
            className="w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            rows="2"
          ></textarea>
          <button
            onClick={handleRegister}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:ring-blue-300 transition duration-300"
          >
            Register
          </button>
        </div>
        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account? <a href="/login" className="ring-blue-600 hover:underline">Login here</a>
        </p>
      </div>
    </div>
  );
}
