import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { Heart, Bookmark, Eye, Calendar, User, ArrowRight } from 'lucide-react';

export default function DebateCard({ debate, currentUser, initialBookmarked = false, onBookmarkRemoved }) {
  const navigate = useNavigate();
  const [likesCount, setLikesCount] = useState(debate.likes?.length || 0);
  const [isLiked, setIsLiked] = useState(
    currentUser ? debate.likes?.includes(currentUser.userId) : false
  );
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const [likeLoading, setLikeLoading] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (likeLoading) return;
    setLikeLoading(true);

    try {
      const res = await api.toggleLike(debate._id);
      setIsLiked(res.liked);
      setLikesCount(res.likesCount);
    } catch (err) {
      console.error('Error liking debate:', err);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (bookmarkLoading) return;
    setBookmarkLoading(true);

    try {
      const res = await api.toggleBookmark(debate._id);
      setIsBookmarked(res.bookmarked);
      if (!res.bookmarked && onBookmarkRemoved) {
        // Callback if we are on the Bookmarks page and want to remove the card immediately
        onBookmarkRemoved(debate._id);
      }
    } catch (err) {
      console.error('Error bookmarking debate:', err);
    } finally {
      setBookmarkLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const creatorName = debate.creator?.username || debate.creator || 'Anonymous';
  const snippet = debate.description.length > 130
    ? debate.description.substring(0, 130) + '...'
    : debate.description;

  return (
    <div className="glass-card hoverable debate-card animate-fade-in">
      <div className="card-header">
        <span className="badge badge-category">{debate.category || 'General'}</span>
        <span className={`badge ${debate.status === 'OPEN' ? 'badge-open' : 'badge-closed'}`}>
          {debate.status}
        </span>
      </div>

      <Link to={`/debate/${debate._id}`} className="card-link">
        <h3 className="card-title">{debate.title}</h3>
        <p className="card-snippet">{snippet}</p>
      </Link>

      {debate.tags && debate.tags.length > 0 && (
        <div className="card-tags">
          {debate.tags.map((tag, i) => (
            <span key={i} className="card-tag">#{tag}</span>
          ))}
        </div>
      )}

      <div className="card-meta">
        <div className="meta-item author" title={`Created by ${creatorName}`}>
          <User size={14} />
          <span>{creatorName}</span>
        </div>
        <div className="meta-item date">
          <Calendar size={14} />
          <span>{formatDate(debate.createdAt)}</span>
        </div>
      </div>

      <div className="card-footer">
        <div className="footer-stats">
          <div className="stat-item" title={`${debate.views} views`}>
            <Eye size={16} />
            <span>{debate.views || 0}</span>
          </div>

          <button
            onClick={handleLike}
            className={`stat-btn like-btn ${isLiked ? 'active' : ''}`}
            disabled={likeLoading}
            title={isLiked ? 'Unlike' : 'Like'}
          >
            <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
            <span>{likesCount}</span>
          </button>
        </div>

        <div className="footer-actions">
          <button
            onClick={handleBookmark}
            className={`stat-btn bookmark-btn ${isBookmarked ? 'active' : ''}`}
            disabled={bookmarkLoading}
            title={isBookmarked ? 'Remove Bookmark' : 'Bookmark'}
          >
            <Bookmark size={16} fill={isBookmarked ? 'currentColor' : 'none'} />
          </button>

          <Link to={`/debate/${debate._id}`} className="btn-enter" title="Enter Arena">
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .debate-card {
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .card-link {
          text-decoration: none;
          color: inherit;
          display: block;
          flex-grow: 1;
        }

        .card-title {
          font-size: 1.25rem;
          line-height: 1.4;
          margin-bottom: 0.75rem;
          transition: color var(--transition-fast);
        }

        .card-link:hover .card-title {
          color: var(--accent-violet);
        }

        .card-snippet {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin-bottom: 1rem;
          line-height: 1.5;
        }

        .card-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 1.25rem;
        }

        .card-tag {
          font-size: 0.8rem;
          color: var(--accent-cyan);
          background: rgba(6, 182, 212, 0.05);
          padding: 0.15rem 0.45rem;
          border-radius: 4px;
        }

        .card-meta {
          display: flex;
          gap: 1rem;
          font-size: 0.8rem;
          color: var(--text-muted);
          border-top: 1px solid var(--glass-border);
          padding-top: 0.75rem;
          margin-bottom: 0.75rem;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .meta-item.author span {
          max-width: 120px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: auto;
          padding-top: 0.5rem;
        }

        .footer-stats, .footer-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .stat-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all var(--transition-fast);
          padding: 0.25rem;
          border-radius: 4px;
        }

        .stat-btn:hover {
          color: var(--text-primary);
        }

        .like-btn:hover, .like-btn.active {
          color: var(--color-against);
        }

        .bookmark-btn:hover, .bookmark-btn.active {
          color: var(--accent-violet);
        }

        .btn-enter {
          color: var(--text-muted);
          transition: all var(--transition-fast);
          display: flex;
          align-items: center;
        }

        .btn-enter:hover {
          color: var(--accent-cyan);
          transform: translateX(3px);
        }
      ` }} />
    </div>
  );
}
