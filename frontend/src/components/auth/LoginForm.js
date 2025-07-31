'use client';

import { useState } from 'react';
import { authAPI } from '../../lib/api';
import { useRouter } from 'next/navigation';
import '../../styles/login.css';

export default function LoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);
  const [login, setLogin] = useState(true);
  const [signup, setSignup] = useState(false);

  const router = useRouter();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await authAPI.login(formData);
      setMessage('✅ Login successful!');
      setUser(response.data.user);
      console.log('User logged in:', response.data.user);
      const token = response.data.token;
      localStorage.setItem('authToken', token); // Store token in localStorage
      setLogin(false);
      setSignup(false);
      router.push('/'); // Redirect to home page after login
    } catch (error) {
      setMessage(`❌ Login failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await authAPI.register(formData);
      setMessage('✅ Sign-up successful!');
      setUser(response.data.user);
      console.log('User logged in:', response.data.user);
      const token = response.data.token;
      localStorage.setItem('authToken', token); // Store token in localStorage
      setSignup(false);
      setLogin(false);
      router.push('/'); // Redirect to home page after sign-up
    } catch (error) {
      setMessage(`❌ Sign-up failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    authAPI.logout();
    localStorage.removeItem('authToken'); // Remove the token
    setUser(null);
    setLogin(false);
    setSignup(false);
    setMessage('Logged out successfully');
  };

  const testConnection = async () => {
    try {
      const response = await authAPI.testProtected();
      setMessage(`✅ Backend connection successful: ${response.message}`);
    } catch (error) {
      setMessage(`❌ Backend connection failed: ${error.message}`);
    }
  };

  if (user) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-green-600">Loading..</h2>
      </div>
    );
  }

  if (signup) {
    return (
      <div className="loginbox" style={{ backdropFilter: 'blur(10px)'}}>
        <h2 className='logsignT' >Sign Up</h2>
        <p className='logsignSmall' >Create your account</p>
        <form onSubmit={handleSignupSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="fieldT">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-800"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password" className="fieldT">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-800"
              placeholder="Enter your password"
            />
          </div>

          <div>
            <label htmlFor="firstName" className="fieldT">
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-800"
              placeholder="Enter your first name"
            />
          </div>

          <div>
            <label htmlFor="lastName" className="fieldT">
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-yellow-500 text-gray-800"
              placeholder="Enter your last name"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="buttonTop T"
          >
            {isLoading ? 'Signing up...' : 'Get Started'}
          </button>
        </form>

        <button
          onClick={() => {
            setSignup(false);
            setLogin(true);
          }}
          className="buttonBottom T"
        >
          Already have an account? Login
        </button>

        {message && (
          <div className="mt-4 p-2 text-sm bg-gray-500 rounded">
            {message}
          </div>
        )}
      </div>
    );
  }

  if (login) {
    return (
      <div className="loginbox" style={{ backdropFilter: 'blur(10px)' }}>
        <h2 className='logsignT' >Sign In</h2>
        <p className='logsignSmall' >Lets get your account</p>
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="fieldT">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-800"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password" className="fieldT">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-800"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="buttonTop T"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <button
          onClick={() => {
            setSignup(true);
            setLogin(false);
          }}
          className="buttonBottom T"
        >
          Don't have an account? Create one
        </button>

        {message && (
          <div className="mt-4 p-2 text-sm bg-gray-500 rounded">
            {message}
          </div>
        )}
      </div>
    );
  }
}