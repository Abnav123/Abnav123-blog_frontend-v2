import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api';
import DebateCard from '../components/DebateCard';
import { Bookmark, Compass, RefreshCw, AlertCircle } from 'lucide-react';

export default function Bookmarks({ currentUser }) {
  const navigate = useNavigate();
  const [debates, setDebates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBookmarks = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await api.getBookmarkedDebates();
      setDebates(data.debates || []);
    } catch (err) {
      console.error('Error fetching bookmarks:', err);
      setError('Failed to load bookmarks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    } else {
      fetchBookmarks();
    }
  }, [currentUser]);

  const handleBookmarkRemoved = (debateId) => {
    setDebates((prevDebates) => prevDebates.filter((d) => d._id !== debateId));
  };

  if (!currentUser) return null;

  return (
    <div className="bookmarks-container">
      {/* Background Glows */}
      <div className="bg-glow-violet"></div>
      <div className="bg-glow-cyan"></div>

      <header className="page-header">
        <div className="title-wrapper">
          <Bookmark className="header-icon" size={32} />
          <div>
            <h1 className="page-title">My Bookmarks</h1>
            <p className="page-subtitle">Discussions and arenas you've saved to keep track of.</p>
          </div>
        </div>

        <button 
          onClick={fetchBookmarks} 
          className="btn btn-secondary btn-refresh" 
          title="Refresh bookmarks"
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? 'spinning' : ''} />
          <span>Refresh</span>
        </button>
      </header>

      <main className="bookmarks-main">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Retrieving your bookmarked discussions...</p>
          </div>
        ) : error ? (
          <div className="error-state glass-card">
            <AlertCircle className="error-icon" size={36} />
            <p className="error-message">{error}</p>
            <button onClick={fetchBookmarks} className="btn btn-primary">
              Retry
            </button>
          </div>
        ) : debates.length === 0 ? (
          <div className="empty-state glass-card">
            <Bookmark className="empty-icon" size={48} />
            <p className="empty-text">You haven't bookmarked any debates yet.</p>
            <p className="empty-subtext">Explore active debates in the arena and save them to watch the arguments unfold.</p>
            <Link to="/" className="btn btn-primary mt-4">
              <Compass size={18} />
              <span>Explore Debates</span>
            </Link>
          </div>
        ) : (
          <div className="grid-cols-3">
            {debates.map((debate) => (
              <DebateCard
                key={debate._id}
                debate={debate}
                currentUser={currentUser}
                initialBookmarked={true}
                onBookmarkRemoved={handleBookmarkRemoved}
              />
            ))}
          </div>
        )}
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .bookmarks-container {
          position: relative;
          min-height: 70vh;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 2.5rem 0;
          border-bottom: 1px solid var(--glass-border);
          margin-bottom: 2.5rem;
          position: relative;
          z-index: 2;
        }

        .title-wrapper {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .header-icon {
          color: var(--accent-violet);
          filter: drop-shadow(0 0 8px rgba(139, 92, 246, 0.4));
        }

        .page-title {
          font-family: var(--font-title);
          font-size: 2.25rem;
          font-weight: 800;
          line-height: 1.2;
          margin-bottom: 0.25rem;
        }

        .page-subtitle {
          color: var(--text-secondary);
          font-size: 0.95rem;
          opacity: 0.8;
        }

        .btn-refresh {
          padding: 0.5rem 1rem !important;
          font-size: 0.9rem !important;
        }

        .spinning {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* States */
        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 6rem 0;
          gap: 1.5rem;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(139, 92, 246, 0.1);
          border-radius: 50%;
          border-top-color: var(--accent-violet);
          animation: spin 0.8s ease-in-out infinite;
        }

        .error-state, .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          max-width: 500px;
          margin: 3rem auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .error-icon {
          color: var(--color-against);
        }

        .error-message {
          color: var(--color-against);
          font-weight: 500;
        }

        .empty-icon {
          color: var(--text-muted);
          opacity: 0.6;
        }

        .empty-text {
          font-size: 1.25rem;
          font-family: var(--font-title);
          font-weight: 700;
          color: var(--text-primary);
        }

        .empty-subtext {
          font-size: 0.95rem;
          color: var(--text-secondary);
          max-width: 350px;
          margin: 0 auto;
          line-height: 1.5;
        }

        .mt-4 {
          margin-top: 1rem;
        }

        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1.25rem;
            padding: 1.5rem 0;
          }

          .btn-refresh {
            align-self: flex-end;
          }
        }
      ` }} />
    </div>
  );
}
