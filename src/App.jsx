import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { api } from './api';

// Components
import Navbar from './components/Navbar';

// Pages
import Home from './pages/Home';
import Auth from './pages/Auth';
import CreateDebate from './pages/CreateDebate';
import DebateDetail from './pages/DebateDetail';
import Bookmarks from './pages/Bookmarks';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user session exists in localStorage
    const savedUser = api.getCurrentUser();
    if (savedUser) {
      setUser(savedUser);
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = (loggedUser) => {
    setUser(loggedUser);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="app-container">
        <Navbar user={user} onLogout={handleLogout} />
        
        <main className="main-content">
          <Routes>
            {/* Explore Debates Page */}
            <Route path="/" element={<Home currentUser={user} />} />
            
            {/* Auth Pages */}
            <Route 
              path="/login" 
              element={user ? <Navigate to="/" replace /> : <Auth onLoginSuccess={handleLoginSuccess} />} 
            />
            <Route 
              path="/register" 
              element={user ? <Navigate to="/" replace /> : <Auth onLoginSuccess={handleLoginSuccess} />} 
            />
            
            {/* Debate Creation / Edit Page */}
            <Route 
              path="/create-debate" 
              element={user ? <CreateDebate currentUser={user} /> : <Navigate to="/login" replace />} 
            />
            
            {/* Detailed Debate / Arena Page */}
            <Route path="/debate/:id" element={<DebateDetail currentUser={user} />} />
            
            {/* Bookmarks Page */}
            <Route 
              path="/bookmarks" 
              element={user ? <Bookmarks currentUser={user} /> : <Navigate to="/login" replace />} 
            />
            
            {/* Fallback Catch-All */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .app-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background-color: var(--bg-dark-900);
        }

        .app-loading .spinner {
          width: 50px;
          height: 50px;
          border: 4px solid rgba(139, 92, 246, 0.1);
          border-radius: 50%;
          border-top-color: var(--accent-violet);
          animation: spin 0.8s ease-in-out infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      ` }} />
    </BrowserRouter>
  );
}
