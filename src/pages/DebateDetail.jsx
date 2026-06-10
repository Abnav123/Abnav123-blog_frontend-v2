import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { 
  ArrowLeft, Heart, Bookmark, Eye, Calendar, User, 
  Trash2, Edit, Lock, Unlock, MessageSquare, Plus, AlertCircle 
} from 'lucide-react';

export default function DebateDetail({ currentUser }) {
  const { id } = useParams();
  const navigate = useNavigate();

  // Data states
  const [debate, setDebate] = useState(null);
  const [argumentsList, setArgumentsList] = useState([]);
  
  // Interaction/UI states
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Likes & Bookmarks local states
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // New argument form states
  const [newArgument, setNewArgument] = useState('');
  const [selectedSide, setSelectedSide] = useState('FOR'); // FOR or AGAINST
  const [submittingArgument, setSubmittingArgument] = useState(false);
  const [argError, setArgError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch single debate
      const debateData = await api.getDebate(id);
      if (!debateData.debate) {
        setError('Debate not found.');
        return;
      }
      setDebate(debateData.debate);
      setLikesCount(debateData.debate.likes?.length || 0);

      // Verify if liked
      if (currentUser) {
        setIsLiked(debateData.debate.likes?.includes(currentUser.userId) || false);
        
        // Fetch bookmarks
        const bookmarkData = await api.getBookmarkedDebates();
        const bookmarked = (bookmarkData.debates || []).some(d => d._id === id);
        setIsBookmarked(bookmarked);
      }

      // Fetch arguments
      const argsData = await api.getArguments(id);
      setArgumentsList(argsData.arguments || []);
    } catch (err) {
      console.error('Error loading debate details:', err);
      setError(err.message || 'Failed to load debate.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id, currentUser]);

  const handleLike = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    try {
      const res = await api.toggleLike(id);
      setIsLiked(res.liked);
      setLikesCount(res.likesCount);
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  const handleBookmark = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    try {
      const res = await api.toggleBookmark(id);
      setIsBookmarked(res.bookmarked);
    } catch (err) {
      console.error('Error toggling bookmark:', err);
    }
  };

  const handleCloseDebate = async () => {
    if (window.confirm('Are you sure you want to close this debate? Arguments can no longer be added.')) {
      setActionLoading(true);
      try {
        const res = await api.closeDebate(id);
        setDebate(res.debate);
      } catch (err) {
        alert(err.message || 'Failed to close debate');
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleReopenDebate = async () => {
    setActionLoading(true);
    try {
      const res = await api.reopenDebate(id);
      setDebate(res.debate);
    } catch (err) {
      alert(err.message || 'Failed to reopen debate');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteDebate = async () => {
    if (window.confirm('CRITICAL: This will permanently delete this debate and all its arguments. Proceed?')) {
      setActionLoading(true);
      try {
        await api.deleteDebate(id);
        navigate('/');
      } catch (err) {
        alert(err.message || 'Failed to delete debate');
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleAddArgument = async (e) => {
    e.preventDefault();
    setArgError('');

    if (!newArgument.trim()) {
      setArgError('Argument content cannot be empty.');
      return;
    }

    setSubmittingArgument(true);
    try {
      const res = await api.addArgument({
        content: newArgument,
        side: selectedSide,
        debateId: id
      });

      // Insert new argument to the list
      setArgumentsList(prev => [...prev, res.argument]);
      setNewArgument('');
    } catch (err) {
      console.error('Error adding argument:', err);
      setArgError(err.message || 'Failed to submit argument.');
    } finally {
      setSubmittingArgument(false);
    }
  };

  if (loading) {
    return (
      <div className="center-loader">
        <div className="spinner"></div>
        <p>Entering the Arena...</p>
      </div>
    );
  }

  if (error || !debate) {
    return (
      <div className="error-wrapper glass-card">
        <AlertCircle size={36} className="text-danger" />
        <h3>Error Accessing Debate</h3>
        <p>{error || 'This debate does not exist.'}</p>
        <Link to="/" className="btn btn-secondary mt-4">
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </div>
    );
  }

  // Filter arguments
  const forArguments = argumentsList.filter(arg => arg.side === 'FOR');
  const againstArguments = argumentsList.filter(arg => arg.side === 'AGAINST');

  // Stats calculation
  const totalArguments = argumentsList.length;
  const forPercent = totalArguments > 0 ? Math.round((forArguments.length / totalArguments) * 100) : 50;
  const againstPercent = totalArguments > 0 ? Math.round((againstArguments.length / totalArguments) * 100) : 50;

  const creatorId = debate.creator?._id || debate.creator;
  const isOwner = currentUser && creatorId === currentUser.userId;
  const creatorName = debate.creator?.username || 'Anonymous';

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  return (
    <div className="arena-container">
      {/* Background Glows */}
      <div className="bg-glow-violet"></div>
      <div className="bg-glow-cyan"></div>

      <div className="back-link-wrapper">
        <Link to="/" className="btn-back">
          <ArrowLeft size={16} />
          <span>Back to Explore</span>
        </Link>
      </div>

      {/* Main Debate Info Card */}
      <header className="debate-detail-card glass-card">
        <div className="card-top-info">
          <div className="tag-badges">
            <span className="badge badge-category">{debate.category || 'General'}</span>
            <span className={`badge ${debate.status === 'OPEN' ? 'badge-open' : 'badge-closed'}`}>
              {debate.status}
            </span>
          </div>

          {isOwner && (
            <div className="owner-actions">
              {debate.status === 'OPEN' ? (
                <button 
                  onClick={handleCloseDebate} 
                  className="btn btn-secondary action-icon-btn" 
                  title="Close Debate"
                  disabled={actionLoading}
                >
                  <Lock size={16} />
                  <span>Close</span>
                </button>
              ) : (
                <button 
                  onClick={handleReopenDebate} 
                  className="btn btn-secondary action-icon-btn" 
                  title="Reopen Debate"
                  disabled={actionLoading}
                >
                  <Unlock size={16} />
                  <span>Reopen</span>
                </button>
              )}
              <Link 
                to={`/edit-debate/${id}`} 
                className="btn btn-secondary action-icon-btn" 
                title="Edit Debate"
              >
                <Edit size={16} />
                <span>Edit</span>
              </Link>
              <button 
                onClick={handleDeleteDebate} 
                className="btn btn-danger action-icon-btn" 
                title="Delete Debate"
                disabled={actionLoading}
              >
                <Trash2 size={16} />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>

        <h1 className="debate-detail-title">{debate.title}</h1>

        <div className="debate-meta-stats">
          <div className="meta-pair">
            <User size={16} />
            <span>Created by <strong className="creator-highlight">{creatorName}</strong></span>
          </div>
          <div className="meta-pair">
            <Calendar size={16} />
            <span>{formatDate(debate.createdAt)}</span>
          </div>
          <div className="meta-pair">
            <Eye size={16} />
            <span>{debate.views} views</span>
          </div>
        </div>

        <p className="debate-detail-desc">{debate.description}</p>

        {debate.tags && debate.tags.length > 0 && (
          <div className="detail-tags">
            {debate.tags.map((tag, idx) => (
              <span key={idx} className="card-tag">#{tag}</span>
            ))}
          </div>
        )}

        <div className="detail-footer-buttons">
          <button 
            onClick={handleLike} 
            className={`detail-like-btn ${isLiked ? 'active' : ''}`}
            title={isLiked ? 'Unlike' : 'Like'}
          >
            <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
            <span>{likesCount} Likes</span>
          </button>

          <button 
            onClick={handleBookmark} 
            className={`detail-bookmark-btn ${isBookmarked ? 'active' : ''}`}
            title={isBookmarked ? 'Remove Bookmark' : 'Bookmark'}
          >
            <Bookmark size={20} fill={isBookmarked ? 'currentColor' : 'none'} />
            <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
          </button>
        </div>
      </header>

      {/* Consensus Balance Meter */}
      <section className="consensus-section glass-card">
        <h3 className="consensus-title">Consensus Meter</h3>
        <div className="consensus-bar-wrapper">
          <div className="consensus-bar">
            <div 
              className="bar-for" 
              style={{ width: `${forPercent}%` }}
              title={`${forArguments.length} FOR arguments`}
            ></div>
            <div 
              className="bar-against" 
              style={{ width: `${againstPercent}%` }}
              title={`${againstArguments.length} AGAINST arguments`}
            ></div>
          </div>
          <div className="consensus-labels">
            <span className="text-for">{forPercent}% FOR ({forArguments.length})</span>
            <span className="text-against">{againstPercent}% AGAINST ({againstArguments.length})</span>
          </div>
        </div>
      </section>

      {/* The Arena Columns */}
      <div className="arena-columns">
        {/* FOR COLUMN */}
        <section className="column-container column-for">
          <div className="column-header-box for-header">
            <div className="header-glow for-glow"></div>
            <h3>FOR</h3>
            <span className="arg-count">{forArguments.length} Arguments</span>
          </div>

          <div className="column-args">
            {forArguments.length === 0 ? (
              <div className="empty-column-box">
                <p>No arguments in favor yet.</p>
              </div>
            ) : (
              forArguments.map((arg) => (
                <div key={arg._id} className="argument-card glass-card for-card animate-fade-in">
                  <p className="arg-content">{arg.content}</p>
                  <div className="arg-footer">
                    <span className="arg-author">
                      <User size={12} />
                      {arg.author?.username || 'Anonymous'}
                    </span>
                    <span className="arg-time">
                      {new Date(arg.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* AGAINST COLUMN */}
        <section className="column-container column-against">
          <div className="column-header-box against-header">
            <div className="header-glow against-glow"></div>
            <h3>AGAINST</h3>
            <span className="arg-count">{againstArguments.length} Arguments</span>
          </div>

          <div className="column-args">
            {againstArguments.length === 0 ? (
              <div className="empty-column-box">
                <p>No arguments against yet.</p>
              </div>
            ) : (
              againstArguments.map((arg) => (
                <div key={arg._id} className="argument-card glass-card against-card animate-fade-in">
                  <p className="arg-content">{arg.content}</p>
                  <div className="arg-footer">
                    <span className="arg-author">
                      <User size={12} />
                      {arg.author?.username || 'Anonymous'}
                    </span>
                    <span className="arg-time">
                      {new Date(arg.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Argument Posting Form */}
      <section className="add-argument-section glass-card">
        {debate.status === 'CLOSED' ? (
          <div className="closed-banner">
            <Lock size={20} />
            <span>This debate has been closed. You can no longer post new arguments.</span>
          </div>
        ) : currentUser ? (
          <form onSubmit={handleAddArgument} className="argument-form">
            <h3 className="form-title">Enter the Debate</h3>
            
            {argError && (
              <div className="alert-message alert-error">
                <AlertCircle size={16} />
                <span>{argError}</span>
              </div>
            )}

            <div className="side-selector-wrapper">
              <span className="selector-label">Choose your side:</span>
              <div className="side-buttons">
                <button
                  type="button"
                  onClick={() => setSelectedSide('FOR')}
                  className={`side-btn for-select-btn ${selectedSide === 'FOR' ? 'active' : ''}`}
                >
                  FOR (Green)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSide('AGAINST')}
                  className={`side-btn against-select-btn ${selectedSide === 'AGAINST' ? 'active' : ''}`}
                >
                  AGAINST (Red)
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="argContent">Write your argument (keep it constructive)</label>
              <textarea
                id="argContent"
                className="input-field argument-textarea"
                rows="4"
                placeholder={`I support the ${selectedSide} side because...`}
                value={newArgument}
                onChange={(e) => setNewArgument(e.target.value)}
                disabled={submittingArgument}
                required
              ></textarea>
            </div>

            <button
              type="submit"
              className={`btn btn-submit-arg ${selectedSide === 'FOR' ? 'btn-success' : 'btn-danger'}`}
              disabled={submittingArgument}
            >
              <Plus size={18} />
              <span>{submittingArgument ? 'Submitting...' : 'Post Argument'}</span>
            </button>
          </form>
        ) : (
          <div className="login-prompt">
            <MessageSquare size={24} />
            <p>You must be signed in to submit an argument in this arena.</p>
            <div className="prompt-buttons">
              <Link to="/login" className="btn btn-primary">Login</Link>
              <Link to="/register" className="btn btn-secondary">Register</Link>
            </div>
          </div>
        )}
      </section>

      <style dangerouslySetInnerHTML={{ __html: `
        .arena-container {
          position: relative;
        }

        .debate-detail-card {
          margin-bottom: 2rem;
          padding: 2.25rem !important;
        }

        .card-top-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.25rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .tag-badges {
          display: flex;
          gap: 0.5rem;
        }

        .owner-actions {
          display: flex;
          gap: 0.5rem;
        }

        .action-icon-btn {
          padding: 0.4rem 0.8rem !important;
          font-size: 0.85rem !important;
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .debate-detail-title {
          font-size: 2rem;
          line-height: 1.3;
          margin-bottom: 1rem;
        }

        .debate-meta-stats {
          display: flex;
          gap: 1.5rem;
          color: var(--text-muted);
          font-size: 0.85rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }

        .meta-pair {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .creator-highlight {
          color: var(--accent-cyan);
        }

        .debate-detail-desc {
          font-size: 1.05rem;
          line-height: 1.6;
          color: var(--text-primary);
          margin-bottom: 1.5rem;
          white-space: pre-wrap;
        }

        .detail-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 2rem;
          border-bottom: 1px solid var(--glass-border);
          padding-bottom: 1.25rem;
        }

        .detail-footer-buttons {
          display: flex;
          gap: 1rem;
        }

        .detail-like-btn, .detail-bookmark-btn {
          background: var(--bg-dark-800);
          border: 1px solid var(--glass-border);
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-family: var(--font-title);
          font-weight: 600;
          font-size: 0.95rem;
          padding: 0.6rem 1.2rem;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .detail-like-btn:hover, .detail-like-btn.active {
          color: var(--color-against);
          border-color: rgba(244, 63, 94, 0.4);
          background: rgba(244, 63, 94, 0.05);
        }

        .detail-bookmark-btn:hover, .detail-bookmark-btn.active {
          color: var(--accent-violet);
          border-color: rgba(139, 92, 246, 0.4);
          background: rgba(139, 92, 246, 0.05);
        }

        /* Consensus meter styles */
        .consensus-section {
          margin-bottom: 2rem;
        }

        .consensus-title {
          font-size: 1.1rem;
          margin-bottom: 1rem;
          text-align: center;
        }

        .consensus-bar-wrapper {
          max-width: 600px;
          margin: 0 auto;
        }

        .consensus-bar {
          height: 14px;
          background: var(--bg-dark-700);
          border-radius: 9999px;
          display: flex;
          overflow: hidden;
          margin-bottom: 0.5rem;
          border: 1px solid var(--glass-border);
        }

        .bar-for {
          background: var(--color-for);
          transition: width 0.5s ease;
        }

        .bar-against {
          background: var(--color-against);
          transition: width 0.5s ease;
        }

        .consensus-labels {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .text-for { color: var(--color-for); }
        .text-against { color: var(--color-against); }

        /* Columns Grid Layout */
        .arena-columns {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .column-container {
          display: flex;
          flex-direction: column;
        }

        .column-header-box {
          position: relative;
          padding: 1rem;
          border-radius: 0.75rem 0.75rem 0 0;
          text-align: center;
          overflow: hidden;
          border: 1px solid var(--glass-border);
          border-bottom: none;
        }

        .header-glow {
          position: absolute;
          width: 150px;
          height: 150px;
          top: -75px;
          left: 50%;
          transform: translateX(-50%);
          pointer-events: none;
          filter: blur(20px);
        }

        .for-glow {
          background: radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, rgba(0,0,0,0) 70%);
        }

        .against-glow {
          background: radial-gradient(circle, rgba(244, 63, 94, 0.4) 0%, rgba(0,0,0,0) 70%);
        }

        .for-header {
          background: rgba(16, 185, 129, 0.08);
          border-top: 3px solid var(--color-for);
        }

        .against-header {
          background: rgba(244, 63, 94, 0.08);
          border-top: 3px solid var(--color-against);
        }

        .column-header-box h3 {
          font-size: 1.3rem;
          letter-spacing: 0.05em;
          margin-bottom: 0.25rem;
        }

        .arg-count {
          font-size: 0.8rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .column-args {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding: 1.25rem;
          background: rgba(15, 23, 42, 0.3);
          border: 1px solid var(--glass-border);
          border-radius: 0 0 0.75rem 0.75rem;
          flex-grow: 1;
          min-height: 200px;
        }

        .argument-card {
          padding: 1.25rem !important;
          animation: fadeIn 0.3s ease;
        }

        .for-card {
          border-left: 3px solid var(--color-for);
        }

        .against-card {
          border-left: 3px solid var(--color-against);
        }

        .arg-content {
          font-size: 0.95rem;
          line-height: 1.5;
          color: var(--text-primary);
          margin-bottom: 0.75rem;
          word-break: break-word;
        }

        .arg-footer {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .arg-author {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-weight: 500;
        }

        .empty-column-box {
          text-align: center;
          padding: 3rem 1rem;
          color: var(--text-muted);
          font-size: 0.9rem;
          border: 1px dashed var(--glass-border);
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
        }

        /* Argument Posting */
        .add-argument-section {
          padding: 2rem !important;
        }

        .closed-banner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          color: var(--text-muted);
          padding: 1rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px dashed var(--glass-border);
          border-radius: 0.5rem;
          font-weight: 500;
        }

        .side-selector-wrapper {
          margin-bottom: 1.25rem;
        }

        .selector-label {
          display: block;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--text-primary);
        }

        .side-buttons {
          display: flex;
          gap: 1rem;
        }

        .side-btn {
          flex: 1;
          padding: 0.75rem;
          border: 1px solid var(--glass-border);
          background: var(--bg-dark-800);
          color: var(--text-secondary);
          font-family: var(--font-title);
          font-weight: 600;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .for-select-btn:hover {
          color: var(--color-for);
          border-color: var(--color-for);
        }

        .for-select-btn.active {
          background: rgba(16, 185, 129, 0.15);
          color: var(--color-for);
          border-color: var(--color-for);
          box-shadow: 0 0 10px rgba(16, 185, 129, 0.2);
        }

        .against-select-btn:hover {
          color: var(--color-against);
          border-color: var(--color-against);
        }

        .against-select-btn.active {
          background: rgba(244, 63, 94, 0.15);
          color: var(--color-against);
          border-color: var(--color-against);
          box-shadow: 0 0 10px rgba(244, 63, 94, 0.2);
        }

        .argument-textarea {
          resize: vertical;
          min-height: 80px;
        }

        .btn-submit-arg {
          margin-top: 1rem;
          padding: 0.75rem 1.5rem !important;
          border-radius: 0.5rem !important;
        }

        .login-prompt {
          text-align: center;
          padding: 1.5rem;
          color: var(--text-secondary);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
        }

        .prompt-buttons {
          display: flex;
          gap: 0.75rem;
          margin-top: 0.5rem;
        }

        .error-wrapper {
          text-align: center;
          padding: 4rem 2rem;
          max-width: 500px;
          margin: 3rem auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        @media (max-width: 800px) {
          .arena-columns {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
        }
      ` }} />
    </div>
  );
}
