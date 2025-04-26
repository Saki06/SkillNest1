import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleManualLogin = async () => {
    try {
      const res = await API.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      toast.success('Logged in!');
      navigate('/profile');
    } catch (err) {
      toast.error('Invalid login!');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      // Get the Google OAuth URL from the backend
      const response = await API.get('/auth/google/login');
      const authUrl = response.data.auth_url;

      // Redirect the user to Google's authorization page
      window.location.href = authUrl;
    } catch (err) {
      console.error('Error initiating Google login:', err);
      toast.error('Failed to initiate Google login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-100 flex items-center justify-center px-4">
      <div className="bg-white shadow-2xl rounded-2xl max-w-md w-full p-8 md:p-10">
        <h1 className="text-3xl font-bold text-center text-blue-800 mb-6">Welcome Back to SkillNest</h1>

        {/* Manual Login Form */}
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <button
            onClick={handleManualLogin}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-300"
          >
            Login
          </button>
        </div>

        <div className="my-6 text-center text-gray-500">or</div>

        {/* Google OAuth Login */}
        <div className="flex justify-center">
  <button
    onClick={handleGoogleLogin}
    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition duration-300"
  >
    <svg className="w-5 h-5" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.64 0 6.55 1.5 8.05 2.76l6-6C34.34 3.18 29.58 1 24 1 14.61 1 6.95 6.48 3.38 14.26l7.6 5.91C12.6 14.21 17.82 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.5 24c0-1.64-.15-3.22-.41-4.74H24v9h12.65c-.55 3.02-2.19 5.57-4.67 7.33l7.3 5.67C43.68 37.4 46.5 31.2 46.5 24z"/>
      <path fill="#FBBC05" d="M10.98 28.09A14.48 14.48 0 0 1 10 24c0-1.42.23-2.8.63-4.09l-7.6-5.91C1.73 17.12 0 20.43 0 24s1.73 6.88 4.63 9.91l7.6-5.82z"/>
      <path fill="#34A853" d="M24 46.5c5.58 0 10.29-1.84 13.7-5.01l-7.3-5.67c-2 1.36-4.56 2.18-6.4 2.18-6.18 0-11.4-4.71-12.99-10.67l-7.6 5.82C6.95 41.52 14.61 46.5 24 46.5z"/>
      <path fill="none" d="M0 0h48v48H0z"/>
    </svg>
    Sign in with Google
  </button>
</div>


        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account? <a href="/register" className="text-blue-600 hover:underline">Register here</a>
        </p>
      </div>
    </div>
  );
}