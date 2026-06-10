import React, { useState, useEffect } from 'react';
import { api } from '../api';
import DebateCard from '../components/DebateCard';
import { Search, SlidersHorizontal, MessageSquarePlus, RefreshCw, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const CATEGORIES = ['All', 'Technology', 'Politics', 'Philosophy', 'Science', 'Sports', 'General'];

export default function Home({ currentUser }) {
  const [debates, setDebates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  
  // To verify bookmarks
  const [bookmarkedIds, setBookmarkedIds] = useState([]);

  const fetchDebates = async () => {
    setLoading(true);
    setError('');
    try {
      const filters = {};
      if (search) filters.search = search;
      if (selectedCategory !== 'All') filters.category = selectedCategory;
      if (selectedStatus !== 'All') filters.status = selectedStatus;

      const data = await api.getDebates(filters);
      setDebates(data.debates || []);

      // If logged in, fetch user bookmarks to highlight bookmarked cards
      if (currentUser) {
        const bookmarkData = await api.getBookmarkedDebates();
        const ids = (bookmarkData.debates || []).map(d => d._id);
        setBookmarkedIds(ids);
      }
    } catch (err) {
      console.error('Error fetching debates:', err);
      setError('Failed to load debates. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDebates();
  }, [selectedCategory, selectedStatus, currentUser]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDebates();
  };

  const clearSearch = () => {
    setSearch('');
    // Trigger fetch after state updates
    setTimeout(() => {
      fetchDebates();
    }, 0);
  };

  return (
    <div className="home-container">
      {/* Background Glows */}
      <div className="bg-glow-violet"></div>
      <div className="bg-glow-cyan"></div>

      {/* Hero Banner */}
      <section className="hero-section">
        <h1 className="hero-title">
          Where Opinions Meet <span className="gradient-text">Consensus</span>
        </h1>
        <p className="hero-subtitle">
          Construct powerful arguments, engage with diverse viewpoints, and see where the community stands on the topics that matter most.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="search-form">
          <div className="search-input-wrapper">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Search debates by title, topic, keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
            {search && (
              <button type="button" onClick={clearSearch} className="search-clear">
                <X size={16} />
              </button>
            )}
          </div>
          <button type="submit" className="btn btn-primary search-btn">
            Search
          </button>
        </form>
      </section>

      {/* Filters and Controls */}
      <section className="filter-section">
        <div className="category-scroll">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`category-chip ${selectedCategory === cat ? 'active' : ''}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="filter-controls-row">
          <div className="status-filter">
            <span className="filter-label">
              <SlidersHorizontal size={14} />
              Status:
            </span>
            <button
              onClick={() => setSelectedStatus('All')}
              className={`status-btn ${selectedStatus === 'All' ? 'active' : ''}`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedStatus('OPEN')}
              className={`status-btn ${selectedStatus === 'OPEN' ? 'active' : ''}`}
            >
              Open
            </button>
            <button
              onClick={() => setSelectedStatus('CLOSED')}
              className={`status-btn ${selectedStatus === 'CLOSED' ? 'active' : ''}`}
            >
              Closed
            </button>
          </div>

          <button onClick={fetchDebates} className="btn-refresh" title="Refresh Debates">
            <RefreshCw size={16} className={loading ? 'spinning' : ''} />
          </button>
        </div>
      </section>

      {/* Debates Listing */}
      <main className="debates-main">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading active discussions...</p>
          </div>
        ) : error ? (
          <div className="error-state glass-card">
            <p className="error-message">{error}</p>
            <button onClick={fetchDebates} className="btn btn-primary">
              Retry
            </button>
          </div>
        ) : debates.length === 0 ? (
          <div className="empty-state glass-card">
            <p className="empty-text">No debates found matching your filters.</p>
            {currentUser ? (
              <Link to="/create-debate" className="btn btn-primary mt-4">
                <MessageSquarePlus size={18} />
                <span>Start the First Debate</span>
              </Link>
            ) : (
              <Link to="/login" className="btn btn-secondary mt-4">
                Login to Start a Debate
              </Link>
            )}
          </div>
        ) : (
          <div className="grid-cols-3">
            {debates.map((debate) => (
              <DebateCard
                key={debate._id}
                debate={debate}
                currentUser={currentUser}
                initialBookmarked={bookmarkedIds.includes(debate._id)}
              />
            ))}
          </div>
        )}
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        .home-container {
          position: relative;
        }

        .hero-section {
          text-align: center;
          padding: 3.5rem 1rem 2.5rem 1rem;
          max-width: 800px;
          margin: 0 auto;
          position: relative;
          z-index: 2;
        }

        .hero-title {
          font-family: var(--font-title);
          font-size: 3rem;
          line-height: 1.15;
          font-weight: 800;
          margin-bottom: 1.25rem;
          letter-spacing: -0.03em;
        }

        .gradient-text {
          background: linear-gradient(135deg, var(--accent-violet) 0%, var(--accent-cyan) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-subtitle {
          font-size: 1.1rem;
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 2.25rem;
          opacity: 0.9;
        }

        /* Search Form */
        .search-form {
          display: flex;
          gap: 0.75rem;
          max-width: 650px;
          margin: 0 auto;
        }

        .search-input-wrapper {
          position: relative;
          flex: 1;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          color: var(--text-muted);
          pointer-events: none;
        }

        .search-input {
          width: 100%;
          padding: 0.85rem 1rem 0.85rem 2.75rem;
          background: var(--glass-bg);
          backdrop-filter: blur(8px);
          border: 1px solid var(--glass-border);
          border-radius: 0.75rem;
          color: var(--text-primary);
          font-family: var(--font-body);
          font-size: 1rem;
          transition: all var(--transition-fast);
        }

        .search-input:focus {
          outline: none;
          border-color: var(--accent-violet);
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.25);
        }

        .search-clear {
          position: absolute;
          right: 1rem;
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
        }

        .search-clear:hover {
          color: var(--text-primary);
        }

        .search-btn {
          border-radius: 0.75rem !important;
          padding: 0 1.5rem !important;
        }

        /* Filter Section */
        .filter-section {
          margin-bottom: 2.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          z-index: 2;
          position: relative;
        }

        .category-scroll {
          display: flex;
          gap: 0.625rem;
          overflow-x: auto;
          padding-bottom: 0.5rem;
          scrollbar-width: thin;
        }

        .category-chip {
          background: var(--bg-dark-800);
          color: var(--text-secondary);
          border: 1px solid var(--glass-border);
          padding: 0.5rem 1.1rem;
          border-radius: 9999px;
          cursor: pointer;
          font-family: var(--font-title);
          font-weight: 500;
          font-size: 0.9rem;
          white-space: nowrap;
          transition: all var(--transition-fast);
        }

        .category-chip:hover {
          background: var(--bg-dark-700);
          color: var(--text-primary);
        }

        .category-chip.active {
          background: var(--accent-violet);
          color: #fff;
          border-color: var(--accent-violet);
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.35);
        }

        .filter-controls-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .status-filter {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--bg-dark-800);
          border: 1px solid var(--glass-border);
          padding: 0.25rem;
          border-radius: 0.5rem;
        }

        .filter-label {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.85rem;
          color: var(--text-muted);
          padding: 0 0.5rem;
          font-weight: 500;
        }

        .status-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          padding: 0.35rem 0.85rem;
          border-radius: 0.375rem;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .status-btn:hover {
          color: var(--text-primary);
        }

        .status-btn.active {
          background: var(--bg-dark-700);
          color: var(--text-primary);
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .btn-refresh {
          background: var(--bg-dark-800);
          border: 1px solid var(--glass-border);
          color: var(--text-muted);
          width: 38px;
          height: 38px;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .btn-refresh:hover {
          color: var(--text-primary);
          background: var(--bg-dark-700);
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
          padding: 5rem 0;
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
          margin: 2rem auto;
        }

        .error-message {
          color: var(--color-against);
          margin-bottom: 1.5rem;
        }

        .empty-text {
          font-size: 1.1rem;
          color: var(--text-secondary);
        }

        .mt-4 {
          margin-top: 1rem;
        }

        @media (max-width: 600px) {
          .hero-title {
            font-size: 2.25rem;
          }
          
          .search-form {
            flex-direction: column;
          }
          
          .search-btn {
            padding: 0.75rem !important;
          }
          
          .filter-controls-row {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
          }
          
          .status-filter {
            justify-content: space-between;
          }

          .btn-refresh {
            align-self: flex-end;
          }
        }
      ` }} />
    </div>
  );
}
