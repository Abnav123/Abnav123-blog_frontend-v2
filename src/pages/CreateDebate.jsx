import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { api } from '../api';
import { MessageSquarePlus, Edit, ArrowLeft, AlertCircle } from 'lucide-react';

const CATEGORIES = ['Technology', 'Politics', 'Philosophy', 'Science', 'Sports', 'General'];

export default function CreateDebate({ currentUser }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [tagsInput, setTagsInput] = useState('');

  // UX states
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');

  // Redirect unauthenticated users
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  // Load debate data for editing
  useEffect(() => {
    if (isEditMode && currentUser) {
      const loadDebateData = async () => {
        setFetching(true);
        setError('');
        try {
          const res = await api.getDebate(id);
          const debate = res.debate;

          if (!debate) {
            setError('Debate not found.');
            return;
          }

          // Author verification: creator can be populating or a string ID
          const creatorId = debate.creator?._id || debate.creator;
          if (creatorId !== currentUser.userId) {
            setError('Unauthorized. Only the creator of this debate can edit it.');
            return;
          }

          // Set form state
          setTitle(debate.title || '');
          setDescription(debate.description || '');
          setCategory(debate.category || 'General');
          setTagsInput(debate.tags ? debate.tags.join(', ') : '');
        } catch (err) {
          console.error('Error fetching debate data:', err);
          setError('Failed to load debate data. It may have been deleted.');
        } finally {
          setFetching(false);
        }
      };

      loadDebateData();
    }
  }, [id, isEditMode, currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !description.trim()) {
      setError('Title and description are required fields.');
      return;
    }

    setLoading(true);

    try {
      // Split comma separated tags into array
      const tags = tagsInput
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      const debatePayload = { title, description, category, tags };

      if (isEditMode) {
        await api.updateDebate(id, debatePayload);
        navigate(`/debate/${id}`);
      } else {
        const res = await api.createDebate(debatePayload);
        const newDebate = res.debate;
        if (newDebate && newDebate._id) {
          navigate(`/debate/${newDebate._id}`);
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      console.error('Error submitting debate:', err);
      setError(err.message || 'An error occurred while saving the debate.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="center-loader">
        <div className="spinner"></div>
        <p>Loading debate information...</p>
      </div>
    );
  }

  return (
    <div className="create-debate-container">
      {/* Background Glow */}
      <div className="bg-glow-violet"></div>

      <div className="back-link-wrapper">
        <Link to={isEditMode ? `/debate/${id}` : '/'} className="btn-back">
          <ArrowLeft size={16} />
          <span>Back to Arena</span>
        </Link>
      </div>

      <div className="create-card glass-card">
        <div className="form-header">
          <div className="icon-badge">
            {isEditMode ? <Edit size={24} /> : <MessageSquarePlus size={24} />}
          </div>
          <h2>{isEditMode ? 'Edit Debate' : 'Launch New Debate'}</h2>
          <p className="form-subtitle">
            {isEditMode
              ? 'Refine the debate topics, category, and tags details.'
              : 'Pose a controversial topic, state your premise, and invite the community to argue.'}
          </p>
        </div>

        {error && (
          <div className="alert-message alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Prevent submit if not authorized or error */}
        {(!isEditMode || error === '') && (
          <form onSubmit={handleSubmit} className="debate-form">
            <div className="form-group">
              <label className="form-label" htmlFor="title">Debate Topic Title</label>
              <input
                type="text"
                id="title"
                className="input-field"
                placeholder="e.g., Should AI systems be granted copyright ownership?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="form-row-2">
              <div className="form-group flex-1">
                <label className="form-label" htmlFor="category">Category</label>
                <select
                  id="category"
                  className="input-field select-field"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={loading}
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group flex-1">
                <label className="form-label" htmlFor="tags">Tags (Comma-separated)</label>
                <input
                  type="text"
                  id="tags"
                  className="input-field"
                  placeholder="e.g., ai, ethics, copyright"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="description">Premise & Description</label>
              <textarea
                id="description"
                className="input-field textarea-field"
                rows="6"
                placeholder="Introduce the subject, set any ground rules, and specify what viewpoints are key to the discussion..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
                required
              ></textarea>
            </div>

            <div className="form-buttons">
              <Link to={isEditMode ? `/debate/${id}` : '/'} className="btn btn-secondary">
                Cancel
              </Link>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading
                  ? (isEditMode ? 'Updating...' : 'Publishing...')
                  : (isEditMode ? 'Update Debate' : 'Publish Debate')}
              </button>
            </div>
          </form>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .create-debate-container {
          max-width: 750px;
          margin: 0 auto;
          position: relative;
          padding: 1rem 0;
        }

        .back-link-wrapper {
          margin-bottom: 1.5rem;
        }

        .btn-back {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-muted);
          text-decoration: none;
          font-weight: 500;
          font-size: 0.95rem;
          transition: color var(--transition-fast);
        }

        .btn-back:hover {
          color: var(--text-primary);
        }

        .create-card {
          padding: 2.5rem !important;
          z-index: 2;
          position: relative;
        }

        .form-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .icon-badge {
          width: 50px;
          height: 50px;
          background: rgba(139, 92, 246, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem auto;
          border: 1px solid rgba(139, 92, 246, 0.2);
          color: var(--accent-violet);
        }

        .form-subtitle {
          color: var(--text-secondary);
          font-size: 0.9rem;
          margin-top: 0.5rem;
          line-height: 1.5;
        }

        .form-row-2 {
          display: flex;
          gap: 1.25rem;
        }

        .flex-1 {
          flex: 1;
        }

        .select-field {
          appearance: none;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23cbd5e1' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>");
          background-repeat: no-repeat;
          background-position: right 0.75rem center;
          background-size: 1rem;
          padding-right: 2rem;
        }

        .textarea-field {
          resize: vertical;
          min-height: 120px;
          line-height: 1.5;
        }

        .form-buttons {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 2rem;
          border-top: 1px solid var(--glass-border);
          padding-top: 1.5rem;
        }

        .center-loader {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 6rem 0;
          gap: 1.5rem;
        }

        @media (max-width: 600px) {
          .form-row-2 {
            flex-direction: column;
            gap: 0;
          }
        }
      ` }} />
    </div>
  );
}
