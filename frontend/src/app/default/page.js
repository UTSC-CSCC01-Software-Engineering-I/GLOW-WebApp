'use client';

import Image from "next/image";
import LoginForm from "../../components/auth/LoginForm";
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Hello() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in by checking localStorage for authToken
    const token = localStorage.getItem('authToken');
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken'); // Remove the token
    router.push('/'); // Redirect to home page
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Login Demo */}
        <LoginForm />
        <div className="mt-4" style={{display: 'flex', justifyContent: 'center', width: '100%'}}>
          <button 
            onClick={() => {
              handleLogout();
              router.push('/');
            }}
            style={{backgroundColor: 'black', fontFamily: 'hubot', padding: '0.9rem',
            borderRadius: '5rem', cursor: 'pointer'
        }} 
        onMouseEnter={(e) => e.target.style.backgroundColor = 'blue'}
        onMouseLeave={(e) => e.target.style.backgroundColor = 'black'}
        >GO BACK</button>

        </div>
        
        
        {/* Connection Status */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 mt-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">System Status</h2>
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
              <span className="text-gray-700">Frontend: Next.js running on port 3000</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></span>
              <span className="text-gray-700">Backend: Express.js configured for port 5000</span>
            </div>
            <div className="flex items-center">
              <span className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></span>
              <span className="text-gray-700">Database: MongoDB connection configured</span>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Start the backend server to test the full MVC connectivity
          </p>
        </div>

        
         
      </div>
    </div>
  );
}
