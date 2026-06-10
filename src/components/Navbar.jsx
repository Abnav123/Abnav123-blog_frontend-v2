import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { api } from '../api';
import { Swords, Bookmark, PlusCircle, LogOut, LogIn, UserPlus, Compass } from 'lucide-react';

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    api.logout();
    onLogout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <Swords className="logo-icon" size={28} />
          <span>DEBATE<span className="text-glow">ARENA</span></span>
        </Link>

        <div className="nav-links">
          <Link to="/" className={`nav-item ${isActive('/') ? 'active' : ''}`}>
            <Compass size={18} />
            <span>Explore</span>
          </Link>

          {user && (
            <>
              <Link to="/bookmarks" className={`nav-item ${isActive('/bookmarks') ? 'active' : ''}`}>
                <Bookmark size={18} />
                <span>Bookmarks</span>
              </Link>
              <Link to="/create-debate" className="btn btn-primary nav-create-btn">
                <PlusCircle size={18} />
                <span>New Debate</span>
              </Link>
            </>
          )}
        </div>

        <div className="nav-auth">
          {user ? (
            <div className="nav-user-menu">
              <span className="nav-username">Hi, {user.username}</span>
              <button onClick={handleLogout} className="btn btn-secondary btn-logout" title="Log Out">
                <LogOut size={18} />
                <span className="logout-text">Logout</span>
              </button>
            </div>
          ) : (
            <div className="nav-auth-buttons">
              <Link to="/login" className="btn btn-secondary nav-btn-login">
                <LogIn size={18} />
                <span>Login</span>
              </Link>
              <Link to="/register" className="btn btn-primary nav-btn-register">
                <UserPlus size={18} />
                <span>Register</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .navbar {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--glass-border);
          padding: 1rem 0;
        }
        
        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .nav-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
          font-family: var(--font-title);
          font-weight: 800;
          font-size: 1.4rem;
          color: var(--text-primary);
          letter-spacing: -0.03em;
        }

        .logo-icon {
          color: var(--accent-violet);
          filter: drop-shadow(0 0 8px rgba(139, 92, 246, 0.6));
        }

        .text-glow {
          color: var(--accent-cyan);
          text-shadow: 0 0 10px rgba(6, 182, 212, 0.4);
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-secondary);
          text-decoration: none;
          font-weight: 500;
          font-size: 0.95rem;
          padding: 0.5rem 0.75rem;
          border-radius: 0.375rem;
          transition: all var(--transition-fast);
        }

        .nav-item:hover, .nav-item.active {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.05);
        }

        .nav-item.active {
          border-bottom: 2px solid var(--accent-violet);
          border-radius: 0.375rem 0.375rem 0 0;
          background: rgba(139, 92, 246, 0.05);
        }

        .nav-create-btn {
          padding: 0.5rem 1rem !important;
          font-size: 0.9rem !important;
        }

        .nav-auth {
          display: flex;
          align-items: center;
        }

        .nav-user-menu {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .nav-username {
          color: var(--text-primary);
          font-weight: 600;
          font-size: 0.95rem;
          background: rgba(6, 182, 212, 0.1);
          padding: 0.35rem 0.85rem;
          border-radius: 9999px;
          border: 1px solid rgba(6, 182, 212, 0.2);
        }

        .btn-logout {
          padding: 0.45rem 0.95rem;
          font-size: 0.85rem;
        }

        .nav-auth-buttons {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .nav-btn-login {
          padding: 0.45rem 0.95rem !important;
          font-size: 0.85rem !important;
        }

        .nav-btn-register {
          padding: 0.45rem 0.95rem !important;
          font-size: 0.85rem !important;
        }

        @media (max-width: 768px) {
          .logout-text, .nav-item span {
            display: none;
          }
          
          .nav-links {
            gap: 0.5rem;
          }

          .nav-username {
            max-width: 100px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
      ` }} />
    </nav>
  );
}
