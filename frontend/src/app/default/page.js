'use client';

import Image from "next/image";
import LoginForm from "../../components/auth/LoginForm";
import WelcomeSection from "../../components/WelcomeSection";
import { useRouter } from 'next/navigation';
import { HUDleft } from "../../components/HUDleft";
import { useEffect } from 'react';
import '../../styles/login.css';

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
    <div className="loginpage">
      <div className="login-container">
        <div className="sidepanel">
          <WelcomeSection />
        <button onClick={() => router.push('/')} className="back-button">
            ← Back to Map
          </button>   
        </div>
        
        <div className="login-form-container">
          <LoginForm />
        </div>
      </div>
      
    </div>
  );
}
