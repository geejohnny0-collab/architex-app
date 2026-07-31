import React, { useState } from 'react';
import { MOCK_PROJECTS } from '../data/mockData';
import { 
  Briefcase, DollarSign, Clock, Tag, Send, Sparkles, Filter, 
  Search, ShieldCheck, CheckCircle2, BadgeCheck, Plus, X, 
  Bookmark, Check, UserCheck, ArrowUpRight, ChevronRight, FileText
} from 'lucide-react';

export default function ProjectsView({ onSendApplicationMessage }) {
  // Expanded Projects Database
  const [projects, setProjects] = useState([]);

  const [activeTab, setActiveTab] = useState('ALL_PROJECTS'); // 'ALL_PROJECTS' | 'MY_BIDS'
  const [filterType, setFilterType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [myBids, setMyBids] = useState([]);

  // Modals
  const [bidModalProject, setBidModalProject] = useState(null);
  const [isPostProjectModalOpen, setIsPostProjectModalOpen] = useState(false);
  const [scopeDrawerProject, setScopeDrawerProject] = useState(null);

  // Bid Form State
  const [bidAmount, setBidAmount] = useState('');
  const [bidTimeline, setBidTimeline] = useState('3 Weeks');
  const [bidPitch, setBidPitch] = useState('');

  // New Project Form State (For Businesses)
  const [newTitle, setNewTitle] = useState('');
  const [newClient, setNewClient] = useState('');
  const [newContractType, setNewContractType] = useState('Fixed Price');
  const [newBudget, setNewBudget] = useState('$20,000 Fixed');
  const [newDuration, setNewDuration] = useState('4 Weeks');
  const [newTags, setNewTags] = useState('React, Python, AWS');
  const [newDescription, setNewDescription] = useState('');

  const handleBidSubmit = (e) => {
    e.preventDefault();
    if (!bidModalProject) return;

    const finalBid = bidAmount || bidModalProject.budget;

    const bidObj = {
      id: 'bid_' + Date.now(),
      projectId: bidModalProject.id,
      title: bidModalProject.title,
      client: bidModalProject.client,
      bidAmount: finalBid,
      timeline: bidTimeline,
      pitch: bidPitch,
      submittedAt: 'Just now',
      status: 'Under Client Review',
      statusColor: '#0a66c2'
    };

    setMyBids([bidObj, ...myBids]);
    setProjects(projects.map(p => p.id === bidModalProject.id ? { ...p, proposalsCount: p.proposalsCount + 1 } : p));

    // Dispatch real message to Client Messages Inbox
    if (onSendApplicationMessage) {
      onSendApplicationMessage({
        recipientName: bidModalProject.clientRole,
        jobTitle: `PROJECT BID: ${bidModalProject.title}`,
        applyType: `${bidModalProject.contractType} Bid`,
        applyRate: finalBid,
        pitch: `Bid Proposal (${finalBid} - ${bidTimeline}): ${bidPitch}`
      });
    }

    alert(`Bid Proposal (${finalBid}) sent directly to ${bidModalProject.clientRole}'s Messages Inbox!`);
    setBidModalProject(null);
    setBidAmount('');
    setBidPitch('');
  };

  const handlePostProjectSubmit = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newClient.trim()) return;

    const newProjectObj = {
      id: 'proj_' + Date.now(),
      title: newTitle.trim(),
      client: newClient.trim(),
      logo: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?auto=format&fit=crop&w=150&q=80',
      contractType: newContractType,
      budget: newBudget,
      duration: newDuration,
      proposalsCount: 0,
      status: 'Hiring',
      verifiedEscrow: true,
      clientRole: 'You (Project Client Lead)',
      tags: newTags.split(',').map(t => t.trim()).filter(Boolean),
      description: newDescription.trim() || 'Exciting engineering contract RFP for technical leads and builders.'
    };

    setProjects([newProjectObj, ...projects]);
    setNewTitle('');
    setNewClient('');
    setNewDescription('');
    setIsPostProjectModalOpen(false);
  };

  const filteredProjects = projects.filter(p => {
    const q = searchQuery.trim().toLowerCase();
    const matchesQuery = !q || 
                         p.title.toLowerCase().includes(q) || 
                         p.client.toLowerCase().includes(q) ||
                         p.tags.some(t => t.toLowerCase().includes(q));

    const matchesType = filterType === 'ALL' || 
                        (filterType === 'FIXED' && p.contractType.includes('Fixed')) ||
                        (filterType === 'HOURLY' && p.contractType.includes('Hourly'));

    return matchesQuery && matchesType;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* 1. TOP HEADER & ACTION BANNER */}
      <div className="glass-panel" style={{ 
        padding: '1.5rem 1.75rem', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: '1rem' 
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.4rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)', margin: 0 }}>
              <Briefcase size={24} style={{ color: 'var(--primary)' }} /> Projects & RFP Marketplace
            </h1>
            <span className="badge badge-primary">Escrow Verified Contracts</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '4px 0 0 0' }}>
            High-impact fixed-price builds, technical advisory contracts, and developer team retainers.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button 
            onClick={() => setActiveTab(activeTab === 'ALL_PROJECTS' ? 'MY_BIDS' : 'ALL_PROJECTS')}
            className={activeTab === 'MY_BIDS' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '0.55rem 1.15rem', fontSize: '0.86rem' }}
          >
            <FileText size={16} /> My Submitted Bids ({myBids.length})
          </button>

          <button 
            onClick={() => setIsPostProjectModalOpen(true)}
            className="btn-primary"
            style={{ padding: '0.55rem 1.25rem', fontSize: '0.86rem', boxShadow: '0 4px 14px var(--primary-glow)' }}
          >
            <Plus size={16} /> Post Project RFP
          </button>
        </div>
      </div>

      {/* 2. SEARCH & CONTRACT TYPE FILTERS */}
      {activeTab === 'ALL_PROJECTS' && (
        <div className="glass-panel" style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Search project RFPs by title, client, or tech stack (React, Python, Vector DBs)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 2.5rem 0.65rem 2.6rem',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-surface-hover)',
                  color: 'var(--text-main)',
                  fontSize: '0.88rem',
                  boxSizing: 'border-box'
                }}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  Clear
                </button>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-muted)' }}>Contract Type:</span>
            {[
              { id: 'ALL', label: 'All Projects' },
              { id: 'FIXED', label: 'Fixed Price Contracts' },
              { id: 'HOURLY', label: 'Hourly Retainers' }
            ].map(pill => (
              <button 
                key={pill.id}
                onClick={() => setFilterType(pill.id)}
                style={{
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.78rem',
                  fontWeight: '600',
                  border: '1px solid',
                  borderColor: filterType === pill.id ? 'var(--primary)' : 'var(--border-color)',
                  background: filterType === pill.id ? 'var(--primary-light)' : 'var(--bg-surface)',
                  color: filterType === pill.id ? 'var(--primary)' : 'var(--text-muted)'
                }}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. MAIN PROJECTS STREAM */}
      {activeTab === 'ALL_PROJECTS' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredProjects.map((proj) => (
            <div 
              key={proj.id} 
              className="glass-panel" 
              style={{ 
                padding: '1.35rem', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '1rem' 
              }}
            >
              {/* Project Header Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                  <img src={proj.logo} alt={proj.client} style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover', border: '1px solid var(--border-color)' }} />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h2 
                        onClick={() => setScopeDrawerProject(proj)}
                        style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-main)', margin: 0, cursor: 'pointer' }}
                      >
                        {proj.title}
                      </h2>
                      <span className="badge badge-success" style={{ background: '#10b98120', color: '#10b981', border: '1px solid #10b98140' }}>
                        <ShieldCheck size={13} /> Escrow Verified
                      </span>
                    </div>

                    <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                      Posted by <strong style={{ color: 'var(--text-main)' }}>{proj.client}</strong> • {proj.proposalsCount} proposals submitted • {proj.duration}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: '800', fontSize: '1.15rem', color: 'var(--accent-green)' }}>{proj.budget}</div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{proj.contractType}</div>
                </div>
              </div>

              {/* Description */}
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.6', margin: 0 }}>
                {proj.description}
              </p>

              {/* Tags & Action Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {proj.tags.map(t => (
                    <span key={t} className="badge badge-primary">{t}</span>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => setScopeDrawerProject(proj)}
                    className="btn-secondary"
                    style={{ padding: '0.45rem 1rem', fontSize: '0.82rem' }}
                  >
                    View Scope
                  </button>

                  <button 
                    onClick={() => setBidModalProject(proj)}
                    className="btn-primary"
                    style={{ padding: '0.45rem 1.25rem', fontSize: '0.82rem' }}
                  >
                    <Send size={15} /> Submit Bid Proposal
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      ) : (
        /* MY SUBMITTED BIDS TRACKER TAB */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {myBids.length === 0 ? (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <h3>No submitted project bids yet.</h3>
              <p style={{ marginTop: '6px', fontSize: '0.875rem' }}>Click "Submit Bid Proposal" on any RFP contract to track your proposals live here!</p>
            </div>
          ) : (
            myBids.map((bid) => (
              <div key={bid.id} className="glass-panel" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.76rem', color: bid.statusColor, fontWeight: '800', marginBottom: '4px' }}>
                    Status: {bid.status}
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>{bid.title}</h3>
                  <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Client: <strong>{bid.client}</strong> • Bid Amount: <strong>{bid.bidAmount}</strong> ({bid.timeline}) • {bid.submittedAt}
                  </div>
                </div>

                <button className="btn-secondary" style={{ padding: '0.45rem 1rem', fontSize: '0.82rem' }}>
                  View Bid Thread
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* 4. SUBMIT BID PROPOSAL MODAL */}
      {bidModalProject && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <h2 style={{ fontSize: '1.15rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <Send size={18} style={{ color: 'var(--primary)' }} /> Submit Project Bid Proposal
              </h2>
              <button onClick={() => setBidModalProject(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleBidSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                <div style={{ background: 'var(--bg-surface-hover)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontWeight: '800', fontSize: '0.95rem', color: 'var(--text-main)' }}>{bidModalProject.title}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Client: {bidModalProject.client} • Est. Budget: {bidModalProject.budget}</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>Your Bid Amount ($):</label>
                    <input 
                      type="text" 
                      placeholder={`e.g. ${bidModalProject.budget}`}
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-hover)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontSize: '0.86rem', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>Delivery Timeline:</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 3 Weeks"
                      value={bidTimeline}
                      onChange={(e) => setBidTimeline(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-hover)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontSize: '0.86rem', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>Proposal Pitch & Architecture Approach *:</label>
                  <textarea 
                    rows={4}
                    required
                    placeholder="Describe how you will execute this build, previous relevant architecture work, and milestones..."
                    value={bidPitch}
                    onChange={(e) => setBidPitch(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-hover)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontSize: '0.86rem', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  <ShieldCheck size={14} style={{ display: 'inline', marginRight: '4px', color: '#10b981' }} />
                  Escrow protection enabled: Funds are locked upon bid acceptance.
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setBidModalProject(null)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Submit Proposal Bid</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. POST PROJECT RFP MODAL (FOR BUSINESSES) */}
      {isPostProjectModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '560px' }}>
            <div className="modal-header">
              <h2 style={{ fontSize: '1.15rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <Plus size={18} style={{ color: 'var(--primary)' }} /> Post a Project Contract RFP
              </h2>
              <button onClick={() => setIsPostProjectModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handlePostProjectSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>Project Title *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Next.js 14 AI Chat Dashboard Build"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-hover)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontSize: '0.86rem', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>Client / Company Name *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Apex Ventures"
                      value={newClient}
                      onChange={(e) => setNewClient(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-hover)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontSize: '0.86rem', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>Contract Type</label>
                    <select 
                      value={newContractType}
                      onChange={(e) => setNewContractType(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-hover)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontSize: '0.86rem' }}
                    >
                      <option>Fixed Price</option>
                      <option>Hourly Retainer</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>Budget Spec ($)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. $25,000 Fixed"
                      value={newBudget}
                      onChange={(e) => setNewBudget(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-hover)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontSize: '0.86rem', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>Estimated Duration</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 4 Weeks"
                      value={newDuration}
                      onChange={(e) => setNewDuration(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-hover)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontSize: '0.86rem', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>Tech Tags (comma separated)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. React, Python, RAG, AWS"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-hover)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontSize: '0.86rem', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)', display: 'block', marginBottom: '4px' }}>Project Scope & Acceptance Criteria *</label>
                  <textarea 
                    rows={4}
                    placeholder="Describe deliverables, architecture goals, and technical requirements..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-hover)', color: 'var(--text-main)', border: '1px solid var(--border-color)', fontSize: '0.86rem', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsPostProjectModalOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Publish Project RFP</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. PROJECT SCOPE DRAWER */}
      {scopeDrawerProject && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '620px' }}>
            <div className="modal-header">
              <div>
                <span className="badge badge-primary">{scopeDrawerProject.contractType}</span>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: '4px 0 0 0', color: 'var(--text-main)' }}>
                  {scopeDrawerProject.title}
                </h2>
              </div>
              <button onClick={() => setScopeDrawerProject(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <img src={scopeDrawerProject.logo} style={{ width: '52px', height: '52px', borderRadius: '10px', objectFit: 'cover' }} />
                <div>
                  <div style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--text-main)' }}>{scopeDrawerProject.client}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Budget: <strong style={{ color: '#10b981' }}>{scopeDrawerProject.budget}</strong> • Timeline: {scopeDrawerProject.duration}</div>
                </div>
              </div>

              <div style={{ background: 'var(--bg-surface-hover)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Project Client Lead</div>
                <div style={{ fontSize: '0.92rem', fontWeight: '800', color: 'var(--text-main)', marginTop: '2px' }}>{scopeDrawerProject.clientRole}</div>
              </div>

              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: '800', marginBottom: '6px', color: 'var(--text-main)' }}>Detailed Technical Scope</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.6', margin: 0 }}>
                  {scopeDrawerProject.description}
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: '800', marginBottom: '8px', color: 'var(--text-main)' }}>Required Tech Tags</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {scopeDrawerProject.tags.map((t, i) => (
                    <span key={i} className="badge badge-primary">{t}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={() => setScopeDrawerProject(null)} className="btn-secondary">Close</button>
              <button 
                onClick={() => {
                  setBidModalProject(scopeDrawerProject);
                  setScopeDrawerProject(null);
                }} 
                className="btn-primary"
              >
                Submit Proposal Bid
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
