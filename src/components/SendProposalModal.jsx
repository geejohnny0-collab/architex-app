import React, { useState } from 'react';
import { X, Send, DollarSign, Clock, FileText, CheckCircle, Sparkles, Video, Image, Link } from 'lucide-react';
import api from '../services/apiService';

export default function SendProposalModal({ isOpen, onClose, targetProject, onSubmitProposal }) {
  const [bidAmount, setBidAmount] = useState('$7,500');
  const [estimatedDelivery, setEstimatedDelivery] = useState('2 Weeks');
  const [coverLetter, setCoverLetter] = useState(
    'Hi! I have extensive experience building scalable Next.js and full-stack solutions. I can complete your project on time with high code quality and test coverage.'
  );
  const [videoDemoUrl, setVideoDemoUrl] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [liveRepoUrl, setLiveRepoUrl] = useState('');

  if (!isOpen || !targetProject) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmitProposal({
      projectId: targetProject.id || targetProject.title,
      projectTitle: targetProject.title || targetProject.content?.slice(0, 50),
      clientName: targetProject.author?.name || targetProject.client || 'Client',
      bidAmount,
      estimatedDelivery,
      coverLetter,
      videoDemoUrl,
      screenshotUrl,
      liveRepoUrl
    });
    alert(`Proposal & Portfolio Proof submitted successfully to ${targetProject.author?.name || targetProject.client || 'Client'}!`);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Send size={20} style={{ color: 'var(--primary)' }} />
            <h2 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Submit Project Proposal</h2>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)', padding: '4px' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {/* Project Summary Banner */}
            <div style={{
              background: 'var(--bg-surface-hover)',
              border: '1px solid var(--border-color)',
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)'
            }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Submitting Proposal For:</div>
              <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-main)', marginTop: '2px' }}>
                {targetProject.title || targetProject.content?.slice(0, 70) + '...'}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--accent-green)', fontWeight: '600', marginTop: '4px' }}>
                Target Budget: {targetProject.projectBudget || targetProject.budget}
              </div>
            </div>

            {/* Bid Amount & Timeline Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '6px' }}>
                  Your Proposal Bid ($):
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <DollarSign size={16} style={{ position: 'absolute', left: '10px', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    value={bidAmount} 
                    onChange={(e) => setBidAmount(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem 0.5rem 2.2rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-app)',
                      color: 'var(--text-main)',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '6px' }}>
                  Estimated Delivery:
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Clock size={16} style={{ position: 'absolute', left: '10px', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    value={estimatedDelivery} 
                    onChange={(e) => setEstimatedDelivery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem 0.5rem 2.2rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-app)',
                      color: 'var(--text-main)',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Cover Letter Textarea */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', marginBottom: '6px' }}>
                Cover Letter & Pitch *
              </label>
              <textarea 
                rows={4}
                required
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Explain why you are the ideal developer for this project..."
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-app)',
                  color: 'var(--text-main)',
                  fontSize: '0.875rem',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Portfolio Proof of Work Attachments Header */}
            <div style={{
              borderTop: '1px solid var(--border-color)',
              paddingTop: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem'
            }}>
              <div style={{ fontSize: '0.86rem', fontWeight: '700', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={16} /> Portfolio Proof of Work & Demo Attachments
              </div>

              {/* Video Demo Link */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px' }}>
                  🎥 Video Demo URL (Loom, YouTube, Vimeo, MP4):
                </label>
                <input 
                  type="url" 
                  placeholder="https://www.loom.com/share/your-demo-video-id"
                  value={videoDemoUrl}
                  onChange={(e) => setVideoDemoUrl(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-app)',
                    color: 'var(--text-main)',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              {/* Portfolio Screenshot / Image Upload & URL */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px' }}>
                  🖼️ Portfolio Screenshot / Design Proof:
                </label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input 
                    type="text" 
                    placeholder="Paste image URL or select file below..."
                    value={screenshotUrl}
                    onChange={(e) => setScreenshotUrl(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-app)',
                      color: 'var(--text-main)',
                      fontSize: '0.85rem'
                    }}
                  />
                  <label className="btn-secondary" style={{ padding: '0.5rem 0.85rem', fontSize: '0.8rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    📁 Browse
                    <input 
                      type="file" 
                      accept="image/*" 
                      style={{ display: 'none' }}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const uploaded = await api.uploadFile(file, 'proposal');
                            if (uploaded?.url) setScreenshotUrl(uploaded.url);
                          } catch (err) {
                            const localUrl = URL.createObjectURL(file);
                            setScreenshotUrl(localUrl);
                          }
                        }
                      }}
                    />
                  </label>
                </div>

                {screenshotUrl && (
                  <div style={{ marginTop: '8px', position: 'relative', width: '100%', maxHeight: '140px', overflow: 'hidden', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <img src={screenshotUrl} alt="Screenshot Preview" style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                    <button 
                      type="button" 
                      onClick={() => setScreenshotUrl('')}
                      style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(0,0,0,0.7)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer' }}
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>

              {/* Live Portfolio App Link */}
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px' }}>
                  🔗 Live Web App / GitHub Repo Link:
                </label>
                <input 
                  type="url" 
                  placeholder="https://github.com/yourhandle/project-repo or https://my-live-demo.com"
                  value={liveRepoUrl}
                  onChange={(e) => setLiveRepoUrl(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-app)',
                    color: 'var(--text-main)',
                    fontSize: '0.85rem'
                  }}
                />
              </div>
            </div>

            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={14} style={{ color: 'var(--primary)' }} />
              Architex Pro badge applied: your proposal & portfolio proof will be highlighted at the top of the client's inbox.
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Submit Bid Proposal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
