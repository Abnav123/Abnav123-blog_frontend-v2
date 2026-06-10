import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { api } from '../api';
import { Swords, Mail, Lock, User, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function Auth({ onLoginSuccess }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isRegisterMode = location.pathname === '/register';

  // Form states
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // UX states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Clear errors when toggling modes
  useEffect(() => {
    setError('');
    setSuccessMsg('');
    setUsername('');
    setEmail('');
    setPassword('');
  }, [location.pathname]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    // Basic Validation
    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }

    if (isRegisterMode && !username) {
      setError('Username is required.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      if (isRegisterMode) {
        // Register User
        await api.register(username, email, password);
        setSuccessMsg('Registration successful! Please login.');
        
        // Auto transition to login screen after 1.5 seconds
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        // Login User
        const res = await api.login(email, password);
        
        // Retrieve session data
        const loggedUser = api.getCurrentUser();
        onLoginSuccess(loggedUser);
        
        // Redirect to homepage
        navigate('/');
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Background Glows */}
      <div className="bg-glow-violet"></div>
      
      <div className="auth-card glass-card">
        <div className="auth-header">
          <div className="auth-logo">
            <Swords className="logo-icon" size={32} />
          </div>
          <h2>{isRegisterMode ? 'Create an Account' : 'Welcome Back'}</h2>
          <p className="auth-subtitle">
            {isRegisterMode 
              ? 'Join the Debate Arena and voice your opinions.' 
              : 'Sign in to access your dashboard, bookmark debates, and vote.'}
          </p>
        </div>

        {error && (
          <div className="alert-message alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="alert-message alert-success-box">
            <AlertCircle size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {isRegisterMode && (
            <div className="form-group">
              <label className="form-label" htmlFor="username">Username</label>
              <div className="input-icon-wrapper">
                <User className="input-icon" size={18} />
                <input
                  type="text"
                  id="username"
                  className="input-field with-icon"
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <div className="input-icon-wrapper">
              <Mail className="input-icon" size={18} />
              <input
                type="email"
                id="email"
                className="input-field with-icon"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div className="input-icon-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                className="input-field with-icon"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <button 
                type="button" 
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-submit"
            disabled={loading}
          >
            {loading 
              ? (isRegisterMode ? 'Creating Account...' : 'Signing In...') 
              : (isRegisterMode ? 'Register' : 'Login')}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {isRegisterMode ? 'Already have an account?' : "Don't have an account?"}{' '}
            <Link to={isRegisterMode ? '/login' : '/register'} className="auth-link">
              {isRegisterMode ? 'Sign In' : 'Sign Up'}
            </Link>
          </p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .auth-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: calc(100vh - 150px);
          position: relative;
          padding: 2rem 1rem;
        }

        .auth-card {
          width: 100%;
          max-width: 450px;
          padding: 2.5rem !important;
          z-index: 2;
          position: relative;
        }

        .auth-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .auth-logo {
          width: 60px;
          height: 60px;
          background: rgba(139, 92, 246, 0.1);
          border-radius: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.25rem auto;
          border: 1px solid rgba(139, 92, 246, 0.2);
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.2);
        }

        .auth-logo .logo-icon {
          color: var(--accent-violet);
        }

        .auth-subtitle {
          color: var(--text-secondary);
          font-size: 0.9rem;
          margin-top: 0.5rem;
          line-height: 1.5;
        }

        /* Inputs with Icons */
        .input-icon-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 0.85rem;
          color: var(--text-muted);
          pointer-events: none;
        }

        .input-field.with-icon {
          padding-left: 2.5rem;
        }

        .password-toggle {
          position: absolute;
          right: 0.85rem;
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 0.25rem;
          border-radius: 4px;
        }

        .password-toggle:hover {
          color: var(--text-primary);
        }

        /* Alerts */
        .alert-message {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.85rem 1rem;
          border-radius: 0.5rem;
          font-size: 0.9rem;
          margin-bottom: 1.5rem;
          line-height: 1.4;
        }

        .alert-error {
          background: rgba(244, 63, 94, 0.12);
          color: var(--color-against);
          border: 1px solid rgba(244, 63, 94, 0.25);
        }

        .alert-success-box {
          background: rgba(16, 185, 129, 0.12);
          color: var(--color-for);
          border: 1px solid rgba(16, 185, 129, 0.25);
        }

        .btn-submit {
          width: 100%;
          padding: 0.85rem !important;
          margin-top: 1rem;
          font-size: 1rem !important;
          border-radius: 0.5rem !important;
        }

        .auth-footer {
          margin-top: 1.75rem;
          text-align: center;
          font-size: 0.9rem;
          color: var(--text-muted);
        }

        .auth-link {
          color: var(--accent-cyan);
          text-decoration: none;
          font-weight: 600;
          transition: color var(--transition-fast);
        }

        .auth-link:hover {
          color: var(--accent-violet);
        }
      ` }} />
    </div>
  );
}
