// client/src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('staff');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const userData = { username, password, role };
      const user = await login(userData);

      // Redirect based on role
      if (user.role === 'admin' || user.role === 'superadmin') {
        navigate('/admin/dashboard'); // Future admin page
      } else {
        navigate('/staff/profile'); // Future staff page
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  const backgroundStyle = {
    backgroundColor: '#f9fafb',
    backgroundImage: `
      repeating-linear-gradient(to right, #dcfce7, #dcfce7 1px, transparent 1px, transparent 80px),
      repeating-linear-gradient(to bottom, #dcfce7, #dcfce7 1px, transparent 1px, transparent 80px)
    `,
  };

  return (
    <div
      className="relative min-h-screen w-full flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8"
      style={backgroundStyle}
    >
      <div className="absolute w-full top-0 p-4 sm:p-6 bg-white/70 backdrop-blur-sm shadow-md">
        <div className="flex items-center space-x-4">
            <svg className="h-10 w-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <h2 className="text-2xl font-extrabold text-gray-900">ASPA TEAM</h2>
        </div>
      </div>

      <div className="w-full max-w-lg">
        <div className="bg-white py-16 px-6 shadow-xl sm:rounded-lg sm:px-12">
          <h3 className="text-2xl font-bold text-center mb-10 text-gray-800">
            Login to your account
          </h3>
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && <p className="text-center text-sm text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
            <Input
              id="username"
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
            />
            <Input
              id="password"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">I am an</label>
              <select
                id="role"
                name="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md shadow-sm"
              >
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="pt-4">
              <Button disabled={isLoading}>
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;