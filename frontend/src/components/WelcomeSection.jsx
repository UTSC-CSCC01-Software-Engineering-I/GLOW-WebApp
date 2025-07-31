'use client';

import { useState, useEffect } from 'react';

const welcomeMessages = [
  {
    description: "Access latest beach data from the Great Lakes of Ontario."
  },
  {
    description: "Access historical data straight from the map."
  },
  {
    description: "Be part of a network that's mapping the Great Lakes of Ontario temperature patterns together."
  }
];

export default function WelcomeSection() {
  const [currentMessage, setCurrentMessage] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Rotate welcome messages every 4 seconds
    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % welcomeMessages.length);
    }, 4000);

    return () => {
      window.removeEventListener('resize', checkMobile);
      clearInterval(interval);
    };
  }, []);

  const message = welcomeMessages[currentMessage];

  if (isMobile) {
    return (
      <div className="welcome-section-mobile">
        <div className="welcome-brand">
          <h1 className="brand-title">Welcome to GLOW</h1>
        </div>  
      </div>
    );
  }

  return (
    <div className="welcome-section">
      <div className="welcome-content">
        <div className="welcome-brand">
          <h1 className="brand-title">Welcome to GLOW</h1>
        </div>
        
        <div className="welcome-message">
          <h3 className="welcome-description">{message.description}</h3>
        </div>
      </div>
    </div>
  );
}