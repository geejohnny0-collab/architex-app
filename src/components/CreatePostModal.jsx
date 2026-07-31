import React, { useState } from 'react';
import { X, Image, Code, DollarSign, Tag, Sparkles } from 'lucide-react';

export default function CreatePostModal({ isOpen, onClose, onSubmitPost }) {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Developers');
  const [hasProjectHiring, setHasProjectHiring] = useState(false);
  const [budget, setBudget] = useState('$5,000 - $10,000');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    onSubmitPost({
      content,
      category,
      hasProposalCTA: hasProjectHiring,
      projectBudget: hasProjectHiring ? budget : null,
      codeSnippet: showCodeInput && codeSnippet.trim() ? codeSnippet : null
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} style={{ color: 'var(--primary)' }} />
            <h2 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Create Post or Hiring Request</h2>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)', padding: '4px' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Category Selector */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Tag size={16} style={{ color: 'var(--text-muted)' }} />
              <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Post Category:</span>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-surface-hover)',
                  color: 'var(--text-main)',
                  fontSize: '0.85rem'
                }}
              >
                <option value="Developers">Developers (Code & Tech)</option>
                <option value="Businesses">Businesses (Showcase & Updates)</option>
                <option value="Trending">Trending Discussion</option>
                <option value="AI">AI & Machine Learning</option>
                <option value="Local">Local Opportunities</option>
              </select>
            </div>

            {/* Main Textarea */}
            <textarea
              placeholder="What are you building, hiring for, or exploring today?"
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              style={{
                width: '100%',
                padding: '0.85rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-app)',
                color: 'var(--text-main)',
                fontSize: '0.92rem',
                resize: 'vertical'
              }}
            />

            {/* Code Snippet Field Toggle */}
            {showCodeInput ? (
              <div style={{ background: '#090d16', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>Attach Code Snippet</span>
                  <button type="button" onClick={() => setShowCodeInput(false)} style={{ color: '#ef4444', fontSize: '0.75rem' }}>Remove</button>
                </div>
                <textarea
                  placeholder="// Paste your code snippet here..."
                  rows={3}
                  value={codeSnippet}
                  onChange={(e) => setCodeSnippet(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    color: '#38bdf8',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.82rem',
                    resize: 'vertical'
                  }}
                />
              </div>
            ) : (
              <button 
                type="button"
                onClick={() => setShowCodeInput(true)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--primary)', fontWeight: '600', width: 'fit-content' }}
              >
                <Code size={16} /> + Attach Code Snippet
              </button>
            )}

            {/* Project Request Hiring Switch */}
            <div style={{
              border: '1px solid var(--border-color)',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-surface-hover)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem' }}>
                <input 
                  type="checkbox" 
                  checked={hasProjectHiring} 
                  onChange={(e) => setHasProjectHiring(e.target.checked)} 
                  style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                />
                This is a Project Hiring Call (Accept Direct Proposals)
              </label>

              {hasProjectHiring && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <DollarSign size={16} style={{ color: 'var(--accent-green)' }} />
                  <span style={{ fontSize: '0.82rem' }}>Estimated Budget:</span>
                  <input 
                    type="text" 
                    value={budget} 
                    onChange={(e) => setBudget(e.target.value)} 
                    placeholder="e.g. $5,000 - $10,000"
                    style={{
                      padding: '4px 8px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-surface)',
                      color: 'var(--text-main)',
                      fontSize: '0.82rem'
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Publish Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
